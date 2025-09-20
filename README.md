# Backend API

A robust Node.js backend application with authentication, audio file management, and cloud storage integration.

## 🚀 Features

- **Authentication System**: Complete user authentication with JWT tokens and refresh token support
- **Audio File Management**: Upload, process, and manage audio files with watermarking capabilities
- **Cloud Storage**: Integrated with Cloudinary for media storage and management
- **Database**: MongoDB integration with Mongoose ODM
- **Caching**: Redis integration for improved performance
- **Security**: Password hashing, input validation, and protected routes
- **Activity Tracking**: User activity logging and monitoring

## 📁 Project Structure

```
├── AudioFile/              # Audio file management module
│   ├── controllers/        # Audio route handlers
│   ├── dto/               # Data Transfer Objects
│   ├── model/             # Audio-related database models
│   ├── routes/            # Audio API routes
│   └── service/           # Audio business logic
├── Auth/                  # Authentication module
│   ├── controllers/       # Authentication handlers
│   ├── dto/              # Auth DTOs
│   ├── models/           # User account models
│   ├── routes/           # Auth API routes
│   └── service/          # Auth business logic
├── User/                 # User management
│   └── models/           # User-related models
├── utils/                # Utility functions and middleware
│   ├── Validation/       # Input validation schemas
│   ├── middleware/       # Express middleware
│   └── helper functions  # Token generation, hashing, etc.
├── lib/                  # External service configurations
│   ├── cloudinary/       # Cloudinary setup
│   ├── db/              # Database connection
│   └── redis/           # Redis configuration
└── server.js            # Application entry point
```

## 🛠️ Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- npm or yarn
- MongoDB database (local or MongoDB Atlas)
- Upstash Redis instance
- Cloudinary account (for audio storage)
- Python API service (running on port 8080)
- Access to the environment configuration image provided separately

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/BitsMind/Web_App_BE.git]
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   ⚠️ **Important**: The `.env` file is not included in this repository for security reasons.
   
   Create a `.env` file in the root directory with the following variables. 
   Refer to the provided environment configuration image for the complete setup:

   ```env
   # Application Environment
   NODE_ENV=production
   
   # Database Configuration
   MONGO_URI=your-mongodb-connection-string
   PORT=5002
   CLIENT_URL=http://localhost:3000
   
   # Python API Integration
   PYTHON_API_URL=http://127.0.0.1:8080
   
   # Audio Cloudinary Account
   AUDIO_API_KEY=your-cloudinary-api-key
   AUDIO_API_SECRET=your-cloudinary-api-secret
   AUDIO_CLOUD_NAME=your-cloudinary-cloud-name
   
   # Rate Limiting
   RATE_LIMIT_WINDOW=15m
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Redis Configuration
   UPSTASH_REDIS_URL=your-upstash-redis-url
   
   # Security Headers
   ENABLE_HELMET=true
   
   # Token Secrets (Generate strong, unique secrets)
   ACCESS_TOKEN_SECRET=your-access-token-secret
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   FINGERPRINT_SECRET=your-fingerprint-secret
   
   # Cookie Configuration
   COOKIE_DOMAIN=.markmyvoices.com
   COOKIE_SAME_SITE=Lax
   
   # Token Configuration
   ACCESS_TOKEN_EXPIRY=30m
   REFRESH_TOKEN_EXPIRY=7d
   TOKEN_AUDIENCE=markmyvoices.com
   TOKEN_ISSUER=markmyvoices.com-auth
   ```

   **Required Services:**
   - MongoDB database (local or cloud)
   - Upstash Redis instance
   - Cloudinary account for audio storage
   - Python API service running on port 8080

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/verify/:token` | Email verification |

### Audio File Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/audio/upload` | Upload audio file |
| GET | `/api/audio/files` | Get user's audio files |
| GET | `/api/audio/file/:id` | Get specific audio file |
| DELETE | `/api/audio/file/:id` | Delete audio file |
| POST | `/api/audio/watermark` | Add watermark to audio |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |
| GET | `/api/user/activities` | Get user activities |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) with enhanced security features:

- **Access Token**: Short-lived token (30 minutes) for API requests
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens
- **Fingerprinting**: Additional security layer for token validation
- **Secure Cookies**: HTTP-only cookies for token storage
- **Protected Routes**: Require valid access token in Authorization header

### Usage Example:
```javascript
// Include in request headers
Authorization: Bearer <your-access-token>

// Cookies are automatically handled by the browser
```

## 🗄️ Database Models

### User Account
- Email, password, verification status
- Role-based access control
- Account creation and update timestamps

### Audio Files
- File metadata, URL, processing status
- User association and upload timestamp
- Watermarking information

### User Activities
- Activity logging for audit purposes
- Timestamp and activity type tracking

### Download Logs
- Track file download activities
- User and file associations

## 🔧 Middleware

- **asyncHandler**: Async error handling wrapper
- **protectRoute**: JWT authentication middleware
- **role**: Role-based access control
- **Validation**: Input validation using schemas

## 🌐 External Services

### Cloudinary
- Media storage and management
- Audio file processing capabilities
- CDN delivery for optimized performance

### Upstash Redis
- Cloud Redis service for session management
- Caching and rate limiting
- Global edge locations for low latency

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment, especially:
- Database connection strings
- JWT secrets (use strong, unique values)
- Cloudinary credentials
- Redis configuration

## 🛡️ Security Features

- Password hashing using bcrypt
- JWT token validation with fingerprinting
- Input sanitization and validation
- Protected routes with role-based access
- CORS configuration
- Rate limiting (100 requests per 15-minute window)
- Helmet.js security headers
- Secure cookie configuration
- Domain-specific cookie settings

## 📝 Development

### Running in Development Mode
```bash
npm run dev
```

### Code Structure Guidelines
- Follow modular architecture patterns
- Separate concerns (controllers, services, models)
- Use DTOs for data validation
- Implement proper error handling
- Write comprehensive tests

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MONGO_URI connection string
   - Ensure MongoDB service is running
   - Verify network access to MongoDB Atlas (if using cloud)

2. **Redis Connection Error**
   - Verify UPSTASH_REDIS_URL is correct
   - Check Upstash dashboard for service status
   - Ensure proper authentication credentials

3. **Cloudinary Upload Issues**
   - Verify AUDIO_API_KEY and AUDIO_API_SECRET
   - Check AUDIO_CLOUD_NAME configuration
   - Verify file size and format limits

4. **JWT Token Errors**
   - Ensure ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are properly set
   - Check token expiration settings (30m for access, 7d for refresh)
   - Verify FINGERPRINT_SECRET is configured

5. **Python API Connection**
   - Ensure Python service is running on port 8080
   - Check PYTHON_API_URL configuration
   - Verify network connectivity between services

6. **Rate Limiting Issues**
   - Check RATE_LIMIT_WINDOW and RATE_LIMIT_MAX_REQUESTS settings
   - Monitor request patterns and adjust limits if needed


## 📄 License

This project is licensed under the BitMinds Team License - see the LICENSE file for details.

## 📞 Support

For support and questions, please contact [nguyenmandat000@gmail.com] or create an issue in the repository.
