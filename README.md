# TenderConnect

A modern tender management platform that connects companies with business opportunities. Built with Next.js frontend and Node.js backend.

## 🚀 Features

- **Company Management**: Register and manage company profiles
- **Tender Discovery**: Search and browse available tenders
- **Advanced Search**: Filter by company name, industry, and services
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Dynamic content loading and updates
- **Secure Authentication**: JWT-based user authentication

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Redux** - React bindings for Redux

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Knex.js** - SQL query builder
- **PostgreSQL** - Database (via Supabase)
- **JWT** - Authentication tokens

## 📁 Project Structure

```
TenderConnect/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages and components
│   │   │   ├── companies/   # Company listing and details
│   │   │   ├── search/      # Search functionality
│   │   │   ├── tenders/     # Tender management
│   │   │   ├── login/       # Authentication pages
│   │   │   └── register/    # User registration
│   │   └── store/           # Redux store configuration
│   ├── public/              # Static assets
│   └── package.json
├── Backend/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   └── migrations/      # Database migrations
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Supabase account)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the Backend directory:
   ```env
   PORT=4000
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run database migrations:**
   ```bash
   npm run migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_BASE=http://localhost:4000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## 🌐 Deployment

### Backend Deployment

#### Option 1: Railway
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### Option 2: Heroku
1. Create a new Heroku app
2. Connect your repository
3. Set environment variables
4. Deploy

#### Option 3: DigitalOcean App Platform
1. Create a new app in DigitalOcean
2. Connect your repository
3. Configure environment variables
4. Deploy

### Frontend Deployment

#### Netlify Deployment

1. **Push your code to GitHub**

2. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the `frontend` folder as the base directory

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

4. **Set environment variables:**
   - `NEXT_PUBLIC_API_BASE`: Your backend URL (e.g., `https://your-backend.railway.app`)

5. **Deploy:**
   - Netlify will automatically build and deploy your site

#### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Companies
- `GET /search/all-companies` - Get all companies
- `GET /search/companies` - Search companies with filters
- `GET /search/companies/:id` - Get company details
- `POST /companies` - Create new company

### Tenders
- `GET /tenders` - Get all tenders
- `GET /tenders/:id` - Get tender details
- `POST /tenders` - Create new tender

### Applications
- `GET /applications` - Get applications
- `POST /applications` - Submit application

## 🎨 UI Components

The application uses a modern, responsive design with:

- **Gradient backgrounds** for visual appeal
- **Card-based layouts** for content organization
- **Dark mode support** for better user experience
- **Smooth animations** and transitions
- **Mobile-first design** for all screen sizes

## 🔒 Security Features

- **JWT Authentication** for secure user sessions
- **Input validation** on both frontend and backend
- **SQL injection protection** via Knex.js
- **CORS configuration** for API security
- **Environment variable protection** for sensitive data

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/tenderconnect
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check if migrations have been run

2. **CORS Errors**
   - Verify the frontend URL is in the backend CORS configuration
   - Check that the API_BASE_URL is correct

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Clear Next.js cache: `rm -rf .next && npm run build`

4. **Netlify Deployment Issues**
   - Check build logs in Netlify dashboard
   - Verify environment variables are set
   - Ensure the build command is correct

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

## 🚀 Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Email notifications
- [ ] File upload functionality
- [ ] Payment integration

---

**Built with ❤️ using Next.js and Node.js** 