# 🍳 Recipe App

A modern, full-stack recipe management application built with React, Node.js, and MongoDB. Share your culinary creations, discover new recipes, and manage your cooking journey with an intuitive and beautiful interface.

## ✨ Features

### 🎯 Core Features
- **Recipe Management**: Create, edit, and organize your personal recipe collection
- **User Authentication**: Secure login/register system with JWT tokens
- **Recipe Categories**: Browse recipes by categories (dinner, lunch, dessert, etc.)
- **Search & Filter**: Find recipes by ingredients, dietary needs, or cooking time
- **Responsive Design**: Beautiful UI that works on desktop, tablet, and mobile

### 🚀 Advanced Features
- **Cooking Mode**: Interactive step-by-step cooking guide with timers and voice guidance
- **Recipe Recommendations**: AI-powered recipe suggestions based on your preferences
- **User Dashboard**: Personal dashboard with cooking statistics and progress tracking
- **Favorites System**: Save and organize your favorite recipes
- **Recipe Ratings & Reviews**: Rate and review recipes
- **Social Features**: Share recipes and discover community creations

### 🎨 User Experience
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Cooking Timer**: Built-in timer functionality for precise cooking
- **Voice Guidance**: Optional voice instructions for hands-free cooking
- **Progress Tracking**: Monitor your cooking achievements and milestones

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **CSS Modules** - Scoped styling for components
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Development Tools
- **Nodemon** - Auto-restart server during development
- **Concurrently** - Run frontend and backend simultaneously
- **ESLint** - Code linting
- **Helmet** - Security middleware

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- MongoDB (local or cloud instance)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe-app
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (root, server, and client)
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or start individually:
   npm run server:dev  # Backend only
   npm run client      # Frontend only
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🚀 Usage

### Getting Started
1. **Register/Login**: Create an account or sign in to access all features
2. **Browse Recipes**: Explore the recipe collection on the home page
3. **Add Your Recipe**: Click "Add Recipe" to share your culinary creations
4. **Use Cooking Mode**: Follow step-by-step instructions with timers
5. **Manage Dashboard**: Track your cooking progress and achievements

### Key Features Guide

#### Adding a Recipe
1. Navigate to "Add Recipe" page
2. Fill in recipe details (title, ingredients, instructions, etc.)
3. Set cooking time, difficulty, and category
4. Submit to save your recipe

#### Cooking Mode
1. Open any recipe detail page
2. Click "Start Cooking Mode"
3. Follow interactive instructions
4. Use built-in timers and voice guidance

#### Recipe Categories
- Browse recipes by category (dinner, lunch, dessert, etc.)
- Filter by difficulty level and cooking time
- Search for specific ingredients or cuisines

## 📁 Project Structure

```
recipe-app/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS modules and styling
│   │   └── contexts/      # React contexts
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/          # Configuration files
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Recipes
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/:id` - Get specific recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/progress` - Get user progress

## 🎯 Key Components

### Frontend Components
- **RecipeForm**: Form for adding/editing recipes
- **RecipeCard**: Display individual recipe cards
- **CookingMode**: Interactive cooking interface
- **Dashboard**: User statistics and management
- **Navbar**: Navigation and theme toggle

### Backend Models
- **User**: User accounts and profiles
- **Recipe**: Recipe data and metadata
- **Session**: Cooking sessions (future feature)
- **Review**: Recipe reviews and ratings

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers middleware

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# The build files will be in client/dist/
```

### Backend Deployment
```bash
# Set NODE_ENV=production
# Ensure MongoDB connection is configured
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Authors

- **Margaret Gitau** - Initial work
- **Carey** - Culinary advisor

## 🙏 Acknowledgments

- React community for the amazing framework
- MongoDB for the flexible database solution
- All contributors and testers

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Contact the development team

---

**Happy Cooking! 🍳✨**
