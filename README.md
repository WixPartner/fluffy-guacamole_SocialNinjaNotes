<div align="center">
# Welcome to A Social Ninja Scroll/Case
  <p><strong>A powerful block-based note-taking and knowledge management platform</strong></p>
</div>

## 🚀 A Social Ninja Scroll's Overview

Ai-SocialNinjaScroll is a modern, feature-rich note-taking application inspired by tools like Notion and Obsidian. It provides a flexible block-based editor with file management, and AI-powered content generation.

<div align="center">
  <img src="/assets/home.png" alt="Mentor Home" width="800"><hr>
</div>
<div align="center">
  <img src="/assets/dashboard.png" alt="Mentor Dashboard" width="800">
</div>


## ✨ Features

### 📝 Block-Based Editor
- Rich text editing with multiple block types
- Code blocks with syntax highlighting for 14+ languages
- LaTeX equation support
- Tables, schedules, and lists
- File attachments with secure storage

<div align="center">
  <img src="/assets/editor.png" alt="Block Editor" width="800">
</div>

### 🔐 Authentication & Security
- Email/password login with verification
- Social authentication (Google, GitHub)
- JWT with refresh tokens
- Password recovery system
- Secure session management

<div align="center">
  <img src="/assets/login.png" alt="Login" width="800"><hr> 
  <img src="/assets/register.png" alt="Register" width="800"><hr>
  <img src="/assets/forgot-password.png" alt="Forgot Password" width="800"><hr>
  <img src="/assets/reset-password.png" alt="Reset Password" width="800">
</div>

### 📂 Page Management
- Hierarchical page organization
- Favorites and recently visited pages
- Trash management
- Page icons and customization
- Drag and drop reordering

<div align="center">
  <img src="/assets/page-management.png" alt="Page Management" width="400">
</div>

### 🤖 AI Integration
- AI-powered block generation
- Support only some block types
- Natural language prompts
- OpenRouter API integration

<div align="center">
  <img src="/assets/ai-integration.png" alt="AI Integration" width="500"><hr>
  <img src="/assets/ai-integration-2.png" alt="AI Integration" width="500">
</div>

### 📁 File Storage using file block
- AWS S3 integration
- Secure file upload/download
- Support for multiple file types
- File metadata handling

<div align="center">
  <img src="/assets/file-storage.png" alt="File Storage" width="500">
</div>

### 💳 Subscription System
- Three-tier subscription model (Free, Pro, Team)
- Stripe integration for payment processing
- Usage limits enforcement
- Subscription management

<div align="center">
  <img src="/assets/subscription.png" alt="Subscription" width="800">
</div>

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- Material-UI for components
- Redux for state management

### Backend
- Node.js with Express
- TypeScript for type safety
- MongoDB for data storage
- JWT for authentication

### Infrastructure
- AWS S3 for file storage
- Stripe for payment processing
- OpenRouter for AI integration
- SMTP for email delivery

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- AWS account (for S3)
- Stripe account (for payments)
- OpenRouter API key (for AI features)

### Installation

1. Clone the repository
```bash
git clone https://github.com/uknes/Ai-SocialNinjaScroll.git
cd Mentor
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# Server (.env file in server directory)
cp .env.example .env
# Edit .env with your configuration

# Client (.env file in client directory)
cp .env.example .env
# Edit .env with your configuration
```

4. Start development servers
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm start
```

## 🔧 Environment Variables

### Server
```
MONGODB_URI=mongodb://localhost:27017/mentor
JWT_SECRET=your-secret-key
PORT=5000
OPENROUTER_API_KEY=your-openrouter-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
CLIENT_URL=http://localhost:3000
```

### Client
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GITHUB_CLIENT_ID=your-github-client-id
```

## 📚 API Reference

### Authentication
```
POST /auth/register       # Register
POST /auth/login          # Login
POST /auth/refresh        # Refresh token
POST /auth/logout         # Logout
GET  /auth/verify/:token  # Verify email
POST /auth/forgot-password # Request password reset
POST /auth/reset-password # Reset password
POST /auth/google         # Google OAuth
POST /auth/github         # GitHub OAuth
```

### Pages
```
GET    /pages              # List all pages
GET    /pages/by-path/:path # Get page by path
POST   /pages              # Create page
PUT    /pages/:id          # Update page
DELETE /pages/:id          # Move to trash
GET    /pages/trash        # List trash
POST   /pages/:id/restore  # Restore from trash
DELETE /pages/:id/permanent # Delete permanently
POST   /pages/reorder      # Reorder pages
GET    /pages/recent       # Get recently visited pages
POST   /pages/:id/visit    # Add page to recently visited
GET    /pages/favorites    # Get favorite pages
POST   /pages/:id/favorite # Add page to favorites
DELETE /pages/:id/favorite # Remove page from favorites
```

## 📋 Upcoming Implementations

- [ ] **Enhanced Collaboration**
  - [ ] Real-time cursor tracking
  - [ ] User presence indicators
  - [ ] Comment system with mentions
  - [ ] Permission management system
  - [ ] Inbox for collaboration

- [ ] **Advanced Block Types**
  - [ ] Kanban board blocks
  - [ ] Timeline view blocks
  - [ ] Database blocks with filtering and sorting
  - [ ] Diagram blocks (flowcharts, mind maps)
  - [ ] Embedded map blocks

- [ ] **Mobile Experience**
  - [ ] Responsive design optimization
  - [ ] Progressive Web App (PWA) support
  - [ ] Touch-friendly interactions

- [ ] **Performance Improvements**
  - [ ] Implement code splitting and lazy loading
  - [ ] Add Redis caching layer
  - [ ] Optimize real-time synchronization
  - [ ] Improve image and asset loading

## 🐳 Docker Setup

You can run the entire application stack using Docker. This includes the client, server, and MongoDB.

### Prerequisites
- Docker
- Docker Compose

### Running with Docker

1. Create a `.env` file in the root directory with all required environment variables:
```bash
# Copy example env files
cp server/.env.example .env
```

2. Build and start all services:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Environment Variables for Docker
Make sure your root `.env` file includes all necessary variables:
```env
# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=your-mongodb-username
MONGO_INITDB_ROOT_PASSWORD=your-mongodb-password

# Server Configuration
JWT_SECRET=your-secret-key
OPENROUTER_API_KEY=your-openrouter-api-key

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com

# Client Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GITHUB_CLIENT_ID=your-github-client-id
```

### Docker Commands

```bash
# Start all services in the background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up -d --build <service_name>

# Remove volumes (clean data)
docker-compose down -v
```

### Container Structure
- **Client**: React application served through Nginx (Port 3000)
- **Server**: Node.js/Express API (Port 5000)
- **MongoDB**: Database (Port 27017)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
This project is licensed under the MIT License - see the LICENSE file for details.
