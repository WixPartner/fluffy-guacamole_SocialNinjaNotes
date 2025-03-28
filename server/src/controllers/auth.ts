import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { User } from '../models/User';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';

// Initialize the Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/google-callback'
);

// Simple in-memory cache to prevent processing the same code multiple times
// In a production environment, this should be replaced with Redis or another distributed cache
const processedCodes = new Set<string>();
// Cleanup old codes periodically (every hour)
setInterval(() => {
  processedCodes.clear();
}, 60 * 60 * 1000);

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    user = new User({
      name,
      email,
      password,
      verificationToken
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email Address - Mentor Platform',
      message: `Please verify your email by clicking: ${verificationUrl}`,
      name: user.name,
      actionUrl: verificationUrl
    });

    // Don't return token, only return success message
    return res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    logger.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const token = user.generateAuthToken();

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    logger.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // In a real implementation, you might want to invalidate the token
    // or remove it from a whitelist/database
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    logger.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message: `You requested a password reset. Please click the link to reset your password: ${resetUrl}`
    });

    return res.json({ message: 'Password reset email sent' });
  } catch (err) {
    logger.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    logger.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.params.token;
    logger.info(`Verification attempt with token: ${token}`);

    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      logger.error(`No user found with token: ${token}`);
      return res.status(400).json({ 
        message: 'Invalid verification token or email already verified',
        success: false
      });
    }

    logger.info(`User found: ${user.email}`);

    // Check if already verified
    if (user.isVerified) {
      logger.info(`User already verified: ${user.email}`);
      return res.status(200).json({ 
        message: 'Email already verified',
        success: true
      });
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    logger.info(`User verified successfully: ${user.email}`);
    return res.status(200).json({ 
      message: 'Email verified successfully',
      success: true
    });
  } catch (err) {
    logger.error('Email verification error:', err);
    return res.status(500).json({ 
      message: 'Server error',
      success: false
    });
  }
};

// @desc    Google OAuth
// @route   POST /api/auth/google
export const googleAuth = async (req: Request, res: Response): Promise<Response> => {
  const { code } = req.body;

  if (!code) {
    logger.error('Google OAuth: Missing authorization code');
    return res.status(400).json({ message: 'Missing authorization code' });
  }
  
  // Check if this code has already been processed
  if (processedCodes.has(code)) {
    logger.warn(`Google OAuth: Code ${code.substring(0, 10)}... has already been processed`);
    return res.status(400).json({ 
      message: 'This authorization code has already been used',
      error: 'bad_verification_code'
    });
  }
  
  // Add code to processed set
  processedCodes.add(code);

  try {
    // Log only the first few characters of the code for security
    const codePrefix = code.substring(0, 10);
    logger.info(`Google OAuth: Processing code ${codePrefix}...`);
    
    // Exchange code for tokens
    let tokens;
    try {
      const { tokens: authTokens } = await googleClient.getToken(code);
      tokens = authTokens;
      logger.info('Google OAuth: Successfully obtained tokens');
    } catch (error: any) {
      logger.error('Google OAuth token exchange error:', error.response?.data || error.message);
      return res.status(400).json({ 
        message: 'Failed to exchange authorization code for tokens',
        error: error.response?.data || error.message
      });
    }
    
    if (!tokens || !tokens.access_token) {
      return res.status(400).json({ message: 'No access token received from Google' });
    }

    // Get user profile information
    let userInfo;
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });
      userInfo = response.data;
      logger.info(`Google OAuth: Got user data for ${userInfo.email}`);
    } catch (error: any) {
      logger.error('Google OAuth user info error:', error.response?.data || error.message);
      return res.status(400).json({ 
        message: 'Failed to get user profile from Google',
        error: error.response?.data || error.message
      });
    }

    const { email, name, picture, sub } = userInfo;

    if (!email) {
      return res.status(400).json({ message: 'Email not found in Google account' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      logger.info(`Google OAuth: Creating new user with email ${email}`);
      user = new User({
        name: name || email.split('@')[0], // Use part of email if name not provided
        email,
        googleId: sub,
        avatar: picture,
        password: crypto.randomBytes(20).toString('hex'), // Random password
        isVerified: true // Google accounts are pre-verified
      });

      await user.save();
    } else if (!user.googleId) {
      // Link Google account to existing user
      logger.info(`Google OAuth: Linking Google account to existing user ${user.id}`);
      user.googleId = sub;
      user.isVerified = true;
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();
    }

    const authToken = user.generateAuthToken();
    logger.info(`Google OAuth: Authentication successful for user ${user.id}`);

    return res.json({
      token: authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    logger.error('Google auth error:', err);
    return res.status(500).json({ 
      message: 'Server error during Google authentication',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

// @desc    GitHub OAuth
// @route   POST /api/auth/github
export const githubAuth = async (req: Request, res: Response): Promise<Response> => {
  const { code } = req.body;

  if (!code) {
    logger.error('GitHub OAuth: Missing authorization code');
    return res.status(400).json({ message: 'Missing authorization code' });
  }
  
  // Check if this code has already been processed
  if (processedCodes.has(code)) {
    logger.warn(`GitHub OAuth: Code ${code.substring(0, 10)}... has already been processed`);
    return res.status(400).json({ 
      message: 'This authorization code has already been used',
      error: 'bad_verification_code'
    });
  }
  
  // Add code to processed set
  processedCodes.add(code);

  try {
    // Log only the first few characters of the code for security
    const codePrefix = code.substring(0, 10);
    logger.info(`GitHub OAuth: Processing code ${codePrefix}...`);
    
    // Exchange code for access token
    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const tokenData = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: 'http://localhost:3000/github-callback'
    };
    
    logger.info(`GitHub OAuth: Using client ID: ${process.env.GITHUB_CLIENT_ID}`);
    
    let accessToken;
    
    try {
      const tokenResponse = await axios.post(
        tokenUrl,
        tokenData,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );
      
      // Check for error response from GitHub
      if (tokenResponse.data.error) {
        logger.error(`GitHub OAuth: Error from GitHub: ${tokenResponse.data.error} - ${tokenResponse.data.error_description}`);
        return res.status(400).json({ 
          message: tokenResponse.data.error_description || 'Error from GitHub OAuth service',
          error: tokenResponse.data
        });
      }
      
      if (!tokenResponse.data.access_token) {
        logger.error('GitHub OAuth: Failed to get access token', tokenResponse.data);
        return res.status(400).json({ 
          message: 'Failed to get access token from GitHub',
          error: tokenResponse.data
        });
      }

      accessToken = tokenResponse.data.access_token;
      logger.info('GitHub OAuth: Successfully obtained access token');
    } catch (error: any) {
      logger.error('GitHub OAuth token exchange error:', error.response?.data || error.message);
      return res.status(400).json({ 
        message: 'Failed to get access token from GitHub',
        error: error.response?.data || error.message
      });
    }
    
    if (!accessToken) {
      return res.status(400).json({ message: 'No access token received from GitHub' });
    }

    // Get user data from GitHub
    let userProfile;
    try {
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${accessToken}`
        }
      });
      userProfile = userResponse.data;
      logger.info(`GitHub OAuth: Got user data for ${userProfile.login}`);
    } catch (error: any) {
      logger.error('GitHub OAuth user profile error:', error.response?.data || error.message);
      return res.status(400).json({ 
        message: 'Failed to get user profile from GitHub',
        error: error.response?.data || error.message
      });
    }

    const { login, id, avatar_url, email: githubEmail } = userProfile;

    // Get user's primary email if not provided in profile
    let email = githubEmail;
    if (!email) {
      try {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `token ${accessToken}`
          }
        });
        const primaryEmail = emailsResponse.data.find(
          (email: any) => email.primary
        );
        email = primaryEmail?.email;
        
        if (email) {
          logger.info(`GitHub OAuth: Retrieved primary email ${email}`);
        } else {
          logger.error('GitHub OAuth: No primary email found in user account');
        }
      } catch (error: any) {
        logger.error('GitHub OAuth email fetch error:', error.response?.data || error.message);
        return res.status(400).json({ 
          message: 'Failed to get email from GitHub',
          error: error.response?.data || error.message
        });
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'No email found in GitHub account' });
    }

    // Find or create user
    try {
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user
        logger.info(`GitHub OAuth: Creating new user with email ${email}`);
        user = new User({
          name: login,
          email,
          githubId: id.toString(),
          avatar: avatar_url,
          password: crypto.randomBytes(20).toString('hex'), // Random password
          isVerified: true // GitHub accounts are pre-verified
        });

        await user.save();
      } else if (!user.githubId) {
        // Link GitHub account to existing user
        logger.info(`GitHub OAuth: Linking GitHub account to existing user ${user.id}`);
        user.githubId = id.toString();
        user.isVerified = true;
        if (!user.avatar && avatar_url) {
          user.avatar = avatar_url;
        }
        await user.save();
      }

      const token = user.generateAuthToken();
      logger.info(`GitHub OAuth: Authentication successful for user ${user.id}`);

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      });
    } catch (error: any) {
      logger.error('GitHub OAuth user creation/update error:', error);
      return res.status(500).json({ 
        message: 'Error creating or updating user account',
        error: error.message
      });
    }
  } catch (err: any) {
    logger.error('GitHub auth error:', err);
    return res.status(500).json({ 
      message: 'Server error during GitHub authentication',
      error: err.message
    });
  }
}; 