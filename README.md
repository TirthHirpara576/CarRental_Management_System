# 🚗 Car Rental Platform

A full-stack web application for car rental services with user bookings, owner management, and integrated payment processing.

---

## ✨ Features

### 👤 **User Features**
- User registration and authentication with JWT
- Browse available cars with advanced filtering
- View detailed car information and pricing
- Book cars with date selection
- Secure payment processing via Razorpay
- Track booking history and status
- Real-time booking notifications

### 🏢 **Owner Features**
- Add and manage rental inventory
- Upload car images with ImageKit
- Approve or reject booking requests
- Track revenue and earnings
- Update booking status (pending → completed)
- Dashboard with analytics

### 🔐 **Technical Features**
- Role-based access control (User/Owner)
- Secure authentication and authorization
- Payment verification and signature validation
- MongoDB data persistence
- Image optimization with ImageKit
- RESTful API architecture
- Error handling and validation

---

## 🛠️ Tech Stack

### **Frontend**
- React 19 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications

### **Backend**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Razorpay for payments
- ImageKit for image management
- Multer for file uploads

---

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- Razorpay account
- ImageKit account

---

## 🚀 Installation & Setup

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd CarRental
```

### **2. Backend Setup**
```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
```

Run the server:
```bash
npm run server    # with nodemon (development)
npm start         # production
```

### **3. Frontend Setup**
```bash
cd client
npm install
```

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

---

## 📁 Project Structure

```
CarRental/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (user & owner routes)
│   │   ├── context/       # App state management
│   │   └── App.jsx        # Main app routing
│   └── package.json
│
├── server/                 # Express backend
│   ├── configs/           # Database & service configurations
│   ├── controllers/       # Route handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & file upload
│   ├── server.js          # Entry point
│   └── package.json
│
└── README.md              # This file
```

---

## 🔄 Booking Workflow

```
1. User Book Car
   ↓
2. Owner Reviews & Approves
   ↓
3. User Pays via Razorpay
   ↓
4. Booking Status: Paid
   ↓
5. Owner Marks as Completed
   ↓
6. Revenue Generated
```

---

## 📡 API Endpoints

### **User Routes** (`/api/user`)
- `POST /register` - User registration
- `POST /login` - User login

### **Cars Routes** (`/api/owner`)
- `POST /add-car` - Add new car (Owner only)
- `GET /cars` - Get all cars
- `PUT /update-car` - Update car details (Owner only)
- `DELETE /delete-car` - Delete car (Owner only)

### **Bookings Routes** (`/api/bookings`)
- `POST /create-booking` - Create booking
- `GET /user-bookings` - Get user's bookings
- `GET /owner-bookings` - Get owner's bookings (Owner only)
- `PUT /update-status` - Update booking status (Owner only)

### **Payment Routes** (`/api/payment`)
- `POST /create-order` - Create Razorpay order
- `POST /verify-payment` - Verify payment signature

---

## 🔐 Environment Variables

**Backend (.env)**
```
PORT                    # Server port
MONGODB_URI            # MongoDB connection string
JWT_SECRET             # JWT signing secret
RAZORPAY_KEY_ID        # Razorpay API key
RAZORPAY_KEY_SECRET    # Razorpay API secret
IMAGEKIT_PUBLIC_KEY    # ImageKit public key
IMAGEKIT_PRIVATE_KEY   # ImageKit private key
IMAGEKIT_URL_ENDPOINT  # ImageKit endpoint URL
```

---

## 🧪 Testing Payment Flow

1. Register as a user
2. Browse available cars
3. Click "Book Now" on any car
4. Fill booking details
5. Wait for owner approval
6. Click "Pay Now" button
7. Use Razorpay test credentials:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits

---

## ✅ Production Deployment

Both frontend and backend are configured with `vercel.json` files for Vercel deployment:

- **Frontend**: Deploy `client/` directory
- **Backend**: Deploy `server/` directory
- Set environment variables in deployment platform


