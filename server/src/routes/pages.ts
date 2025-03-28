import { Router } from 'express';
import { auth } from '../middleware/auth';
import { Page } from '../models/page';
import { User } from '../models/User';
import { SUBSCRIPTION_FEATURES } from '../config/stripe';
import { checkPageLimit } from '../middleware/subscription';
import { checkBlockPermissions } from '../middleware/blockPermissions';

const router = Router();

// Get all pages for the current user
router.get('/', auth, async (req, res) => {
  try {
    const pages = await Page.find({ userId: req.user.id, isDeleted: false }).sort({ order: 1 });
    return res.json(pages);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching pages' });
  }
});

// Get page by path
router.get('/by-path/:path(*)', auth, async (req, res) => {
  try {
    const { path } = req.params;
    const normalizedPath = path.startsWith('/pages/') ? path : `/pages/${path}`;
    
    const page = await Page.findOne({ 
      userId: req.user.id, 
      path: normalizedPath,
      isDeleted: false 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    return res.json(page);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching page' });
  }
});

// Get trashed pages
router.get('/trash', auth, async (req, res) => {
  try {
    const pages = await Page.find({ 
      userId: req.user.id,
      isDeleted: true 
    }).sort({ deletedAt: -1 });
    return res.json(pages);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching trashed pages' });
  }
});

// Reorder pages
router.post('/reorder', auth, async (req, res) => {
  try {
    const { pages } = req.body;
    
    if (!Array.isArray(pages)) {
      return res.status(400).json({ message: 'Pages must be an array' });
    }

    const bulkOps = pages.map(page => ({
      updateOne: {
        filter: { _id: page._id, userId: req.user.id },
        update: { $set: { order: page.order } }
      }
    }));

    await Page.bulkWrite(bulkOps);
    
    // Fetch and return the updated pages
    const updatedPages = await Page.find({ 
      userId: req.user.id, 
      isDeleted: false 
    }).sort({ order: 1 });
    
    return res.json(updatedPages);
  } catch (error: any) {
    console.error('Error reordering pages:', error);
    return res.status(500).json({ 
      message: 'Error reordering pages',
      error: error.message 
    });
  }
});

// Create a new page
router.post('/', auth, checkPageLimit, checkBlockPermissions, async (req, res) => {
  try {
    const { name, path, icon, blocks } = req.body;

    // Validate required fields
    if (!name || !path) {
      return res.status(400).json({ message: 'Name and path are required' });
    }

    // Create the page
    const page = new Page({
      name,
      path,
      icon,
      blocks: blocks || [],
      userId: req.user.id,
      order: await Page.countDocuments({ userId: req.user.id, isDeleted: false })
    });

    await page.save();
    return res.status(201).json(page);
  } catch (error: any) {
    console.error('Error creating page:', error);
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'A page with this path already exists' });
    }
    return res.status(500).json({ message: 'Error creating page' });
  }
});

// Update a page
router.put('/:id', auth, checkBlockPermissions, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate blocks if they are being updated
    if (updates.blocks) {
      // Ensure blocks is an array
      if (!Array.isArray(updates.blocks)) {
        return res.status(400).json({ message: 'Blocks must be an array' });
      }

      // Validate each block
      for (const block of updates.blocks) {
        if (!block.id || !block.type || typeof block.content !== 'string') {
          return res.status(400).json({ 
            message: 'Invalid block format', 
            block,
            required: { id: 'string', type: 'string', content: 'string' }
          });
        }
      }
    }

    // Update the page using findOneAndUpdate
    const updatedPage = await Page.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { 
        ...updates,
        lastEditedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedPage) {
      return res.status(404).json({ message: 'Page not found' });
    }

    return res.json(updatedPage);
  } catch (error: any) {
    console.error('Error updating page:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
    }
    return res.status(500).json({ 
      message: 'Server error while updating page',
      error: error.message 
    });
  }
});

// Delete a page (move to trash)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findOne({ _id: id, userId: req.user.id });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    page.isDeleted = true;
    page.deletedAt = new Date();
    await page.save();

    return res.json(page);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});

// Restore page from trash
router.post('/:id/restore', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findOne({ _id: id, userId: req.user.id });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    page.isDeleted = false;
    page.deletedAt = undefined;
    await page.save();

    return res.json(page);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});

// Permanently delete page
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findOneAndDelete({ _id: id, userId: req.user.id });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    return res.json({ message: 'Page permanently deleted', _id: id });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});

// Add page to recently visited
router.post('/:id/visit', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid page ID format' });
    }

    const page = await Page.findOne({ _id: id, userId: req.user.id });
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Update user's recently visited pages with retries
    let retries = 3;
    while (retries > 0) {
      try {
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Initialize recentlyVisited if it doesn't exist
        if (!Array.isArray(user.recentlyVisited)) {
          user.recentlyVisited = [];
        }

        // Remove if already exists
        user.recentlyVisited = user.recentlyVisited.filter(
          visit => visit.pageId?.toString() !== id
        );

        // Add to start of array
        user.recentlyVisited.unshift({
          pageId: page._id,
          visitedAt: new Date()
        });

        // Keep only last 6 items
        user.recentlyVisited = user.recentlyVisited.slice(0, 6);

        await user.save();

        // Return recently visited pages with populated page data
        const populatedUser = await User.findById(user._id)
          .populate({
            path: 'recentlyVisited.pageId',
            select: 'name path icon'
          });

        // Ensure we return an array even if population fails
        const recentlyVisited = populatedUser?.recentlyVisited || [];
        return res.json(recentlyVisited);
      } catch (error: any) {
        if (error.name === 'VersionError' && retries > 1) {
          retries--;
          continue;
        }
        throw error;
      }
    }

    // If all retries failed, return an error
    return res.status(500).json({ 
      message: 'Failed to update recently visited after multiple retries'
    });
  } catch (error) {
    console.error('Error updating recently visited:', error);
    return res.status(500).json({ 
      message: 'Server error while updating recently visited',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recently visited pages
router.get('/recent', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'recentlyVisited.pageId',
        select: 'name path icon'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user.recentlyVisited || []);
  } catch (error) {
    console.error('Error fetching recently visited pages:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get favorite pages
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'favorites',
        select: 'name path icon'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user.favorites || []);
  } catch (error) {
    console.error('Error fetching favorite pages:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Add page to favorites
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid page ID format' });
    }

    const page = await Page.findOne({ _id: id, userId: req.user.id });
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize favorites if it doesn't exist
    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    // Check if page is already in favorites
    if (user.favorites.includes(page._id)) {
      return res.status(400).json({ message: 'Page already in favorites' });
    }

    // Add to favorites
    user.favorites.push(page._id);
    await user.save();

    // Return updated favorites with populated page data
    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'favorites',
        select: 'name path icon'
      });

    return res.json(populatedUser?.favorites || []);
  } catch (error) {
    console.error('Error adding page to favorites:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Remove page from favorites
router.delete('/:id/favorite', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid page ID format' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize favorites if it doesn't exist
    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(pageId => pageId.toString() !== id);
    await user.save();

    // Return updated favorites with populated page data
    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'favorites',
        select: 'name path icon'
      });

    return res.json(populatedUser?.favorites || []);
  } catch (error) {
    console.error('Error removing page from favorites:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get page usage statistics
router.get('/usage', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentPageCount = await Page.countDocuments({ 
      userId: req.user.id, 
      isDeleted: false 
    });

    const maxPages = SUBSCRIPTION_FEATURES[user.subscription.tier].maxPages;

    return res.json({
      currentCount: currentPageCount,
      maxAllowed: maxPages,
      tier: user.subscription.tier,
      percentageUsed: (currentPageCount / maxPages) * 100,
      remaining: maxPages - currentPageCount
    });
  } catch (error) {
    console.error('Error fetching page usage:', error);
    return res.status(500).json({ message: 'Error fetching page usage statistics' });
  }
});

export default router; 