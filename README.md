# HAMS Backend - Healthcare Appointment Management System

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack & Concepts](#tech-stack--concepts)
- [Directory Structure](#directory-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Authentication & Security](#authentication--security)
- [Email Notifications](#email-notifications)
- [Geospatial Features](#geospatial-features)
- [Error Handling](#error-handling)
- [Sample Data](#sample-data)
- [Contributing](#contributing)

---

## 🏥 Overview

HAMS Backend is a comprehensive Node.js/Express REST API for a Healthcare Appointment Management System. It provides a complete solution for managing healthcare appointments, connecting patients with doctors and hospitals, and facilitating the entire appointment lifecycle from booking to completion.

### Key Features
- **Multi-User Authentication**: Separate login/signup for doctors, patients, and hospitals
- **Appointment Management**: Book, reschedule, cancel, and track appointments
- **Geospatial Search**: Find nearby doctors and hospitals using coordinates
- **Review System**: Rate and review doctors with automatic rating calculations
- **Email Notifications**: Automated confirmation and reminder emails
- **Real-time Status Updates**: Track appointment status changes
- **Payment Status Tracking**: Monitor payment status for appointments

---

## 🛠 Tech Stack & Concepts

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling tool
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **nodemailer** - Email service
- **node-schedule** - Task scheduling for reminders

### Key Concepts Implemented

#### 1. **RESTful API Design**
- Resource-based URL structure
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent response formats
- Proper status codes

#### 2. **Authentication & Authorization**
- JWT-based token authentication
- Password encryption using bcrypt
- Role-based access control
- Secure token generation and validation

#### 3. **Geospatial Queries**
- MongoDB geospatial indexes
- Location-based doctor/hospital search
- Distance calculations using coordinates
- Proximity-based recommendations

#### 4. **Email Automation**
- Appointment confirmation emails
- Scheduled reminder emails (24h before)
- Node-schedule for task scheduling
- Template-based email content

#### 5. **Data Validation**
- Mongoose schema validation
- Input sanitization
- Custom validation rules
- Error handling middleware

---

## 📁 Directory Structure

```
HAMS_Backend/
├── config/                 # Configuration files
│   └── email.js           # Email service configuration
├── controllers/           # Business logic handlers
│   ├── appointmentController.js
│   ├── authController.js
│   ├── doctorControllers.js
│   ├── hospitalControllers.js
│   └── reviewController.js
├── middlewares/          # Express middlewares
│   └── JWTmiddleware.js  # JWT authentication middleware
├── models/               # Mongoose data models
│   ├── appointmentModel.js
│   ├── doctorModel.js
│   ├── hospitalModel.js
│   ├── patientModel.js
│   └── reviewModel.js
├── routes/               # API route definitions
│   ├── appointmentRoutes.js
│   ├── appointments.js   # Email-related routes
│   ├── doctorRoutes.js
│   ├── hospitalRoutes.js
│   ├── patientRoutes.js
│   └── reviewRoutes.js
├── sample_data/          # Test data files
│   ├── sampleDoctors.json
│   ├── sampleHospitals.json
│   └── samplePatients.json
├── scripts/              # Utility scripts
│   └── createEtheral.cjs # Email testing setup
├── services/             # Business services
│   └── emailService.js   # Email sending service
├── server.js             # Application entry point
├── package.json          # Dependencies and scripts
└── .env                  # Environment variables
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HAMS_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:3000
   # Expected: {"message": "Route working perfectly"}
   ```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URL=mongodb://localhost:27017/hams

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional: Firebase Admin (if using Firebase)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 👨‍⚕️ Doctor Routes

### 1. Doctor Registration
**POST** `/doctors/signup`

Creates a new doctor account with encrypted password and generates JWT token.

**Request Body:**
```json
{
  "name": "Dr. John Smith",
  "phone": "9876543210",
  "email": "john.smith@hospital.com",
  "gender": "Male",
  "location": {
    "type": "Point",
    "coordinates": [80.2707, 13.0827]
  },
  "medicalReg": "TN123456",
  "specialization": "Cardiology",
  "photo": "https://example.com/photo.jpg",
  "overview": "Experienced cardiologist with 10+ years of practice",
  "Organisation": "City General Hospital",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "doctor": {
    "doctorId": "123456",
    "name": "Dr. John Smith",
    "phone": "9876543210",
    "email": "john.smith@hospital.com",
    "specialization": "Cardiology",
    "averageRating": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Doctor Login
**POST** `/doctors/login`

Authenticates doctor credentials and returns JWT token.

**Request Body:**
```json
{
  "phone": "9876543210",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Find Nearby Doctors
**GET** `/doctors/nearby/:lat/:lon`

Finds doctors within 20km radius using geospatial queries.

**Parameters:**
- `lat` (number): Latitude coordinate
- `lon` (number): Longitude coordinate

**Example:**
```
GET /doctors/nearby/13.0827/80.2707
```

**Response (200):**
```json
[
  {
    "doctorId": "123456",
    "name": "Dr. John Smith",
    "specialization": "Cardiology",
    "location": {
      "type": "Point",
      "coordinates": [80.2707, 13.0827]
    },
    "averageRating": 4.5,
    "Organisation": "City General Hospital"
  }
]
```

### 4. Top-Rated Doctors
**GET** `/doctors/top/:lat/:lon`

Finds top-rated doctors within 50km radius, sorted by rating.

**Response (200):**
```json
{
  "doctors": [
    {
      "doctorId": "123456",
      "name": "Dr. John Smith",
      "specialization": "Cardiology",
      "averageRating": 4.8,
      "reviewsCount": 45
    }
  ]
}
```

### 5. Doctor Profile
**GET** `/doctors/:doctorId/profile`

Retrieves complete doctor profile information.

**Response (200):**
```json
{
  "doctor": {
    "doctorId": "123456",
    "name": "Dr. John Smith",
    "phone": "9876543210",
    "email": "john.smith@hospital.com",
    "specialization": "Cardiology",
    "overview": "Experienced cardiologist...",
    "averageRating": 4.5,
    "Organisation": "City General Hospital"
  }
}
```

### 6. Update Doctor Overview
**PUT** `/doctors/update/:id`

Updates doctor's professional overview.

**Request Body:**
```json
{
  "overview": "Updated professional overview with new qualifications and experience."
}
```

---

## 👤 Patient Routes

### 1. Patient Registration
**POST** `/patients/signup`

Creates a new patient account with structured address and emergency contact.

**Request Body:**
```json
{
  "fullName": "Jane Doe",
  "phone": "9876543210",
  "email": "jane.doe@email.com",
  "gender": "Female",
  "dateOfBirth": "1990-05-15",
  "street": "123 Main Street",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "postalCode": "600001",
  "emergencyName": "John Doe",
  "emergencyPhone": "9876543211",
  "emergencyRelation": "Spouse",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "patient": {
    "patientId": "654321",
    "name": "Jane Doe",
    "phone": "9876543210",
    "email": "jane.doe@email.com",
    "address": {
      "street": "123 Main Street",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "postalCode": "600001"
    },
    "emergencyContact": {
      "name": "John Doe",
      "phone": "9876543211",
      "relation": "Spouse"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Patient Login
**POST** `/patients/login`

Authenticates patient credentials.

**Request Body:**
```json
{
  "phone": "9876543210",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "patientId": "654321",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🏥 Hospital Routes

### 1. Hospital Registration
**POST** `/hospitals/signup`

Creates a new hospital account with location coordinates.

**Request Body:**
```json
{
  "name": "City General Hospital",
  "RegId": "HOSP123456",
  "phone": "044-12345678",
  "email": "info@cityhospital.com",
  "address": "456 Hospital Road, Chennai",
  "location": {
    "type": "Point",
    "coordinates": [80.2707, 13.0827]
  },
  "specializations": ["Cardiology", "Neurology", "Orthopedics"],
  "password": "securePassword123"
}
```

### 2. Find Nearby Hospitals
**GET** `/hospitals/getAll/:lat/:lon`

Finds hospitals within proximity using geospatial search.

**Response (200):**
```json
[
  {
    "name": "City General Hospital",
    "address": "456 Hospital Road, Chennai",
    "location": {
      "type": "Point",
      "coordinates": [80.2707, 13.0827]
    },
    "specializations": ["Cardiology", "Neurology"]
  }
]
```

---

## 📅 Appointment Routes

### 1. Book Appointment
**POST** `/appointments/book`

Creates a new appointment with validation for slot availability.

**Request Body:**
```json
{
  "date": "2024-02-15",
  "patientId": "654321",
  "doctorId": "123456",
  "payStatus": "Unpaid",
  "clinicId": "CLINIC001",
  "slotNumber": "09:00",
  "reason": "Regular checkup for heart condition"
}
```

**Response (201):**
```json
{
  "message": "Appointment slot booked successfully",
  "appId": "789012"
}
```

### 2. Get Patient Appointments
**GET** `/appointments/patient/:patientId`

Retrieves all appointments for a specific patient.

**Response (200):**
```json
[
  {
    "appointmentId": "789012",
    "date": "2024-02-15T00:00:00.000Z",
    "slotNumber": "09:00",
    "reason": "Regular checkup",
    "appStatus": "Pending",
    "payStatus": "Unpaid",
    "doctorId": {
      "name": "Dr. John Smith"
    }
  }
]
```

### 3. Pending Appointments
**GET** `/appointments/pending/:date`

Lists all pending appointments for a specific date.

**Query Parameters:**
- `doctorId` (optional): Filter by specific doctor

**Example:**
```
GET /appointments/pending/2024-02-15?doctorId=123456
```

### 4. Previous Appointments
**GET** `/appointments/previous`

Lists completed appointments for a doctor.

**Query Parameters:**
- `doctorId` (required): Doctor ID

### 5. Update Appointment Status
**PUT** `/appointments/update-status/:appId`

Updates appointment status (Confirmed, Cancelled, Completed, etc.).

**Request Body:**
```json
{
  "appStatus": "Confirmed",
  "rejectionReason": "Optional reason if status is Rejected"
}
```

### 6. Reschedule Appointment
**PUT** `/appointments/reschedule`

Changes appointment time or slot.

**Request Body:**
```json
{
  "appId": "789012",
  "newTime": "10:00",
  "newSlotNumber": "10:00"
}
```

### 7. Cancel Appointment
**PUT** `/appointments/cancel`

Cancels an existing appointment.

**Request Body:**
```json
{
  "appId": "789012"
}
```

### 8. Delete Appointment
**DELETE** `/appointments/delete`

Permanently removes an appointment from the system.

**Request Body:**
```json
{
  "appId": "789012"
}
```

---

## 📧 Appointment Email Routes

### 1. Book with Email Notifications
**POST** `/appointmentsEmail/book`

Books appointment and automatically sends confirmation email and schedules reminder.

**Request Body:**
```json
{
  "email": "patient@email.com",
  "date": "2024-02-15",
  "time": "09:00",
  "doctorName": "Dr. John Smith",
  "patientName": "Jane Doe"
}
```

**Response (201):**
```json
{
  "message": "Booked, confirmation sent, reminder scheduled."
}
```

**Features:**
- Immediate confirmation email
- Automated reminder email (24h before appointment)
- Uses node-schedule for task scheduling

---

## ⭐ Review Routes

### 1. Create Review
**POST** `/reviews`

Creates a new review and automatically updates doctor's average rating.

**Request Body:**
```json
{
  "doctorId": "123456",
  "patientId": "654321",
  "rating": 5,
  "comment": "Excellent doctor, very professional and caring."
}
```

**Response (201):**
```json
{
  "message": "Review added successfully",
  "review": {
    "reviewId": "REV001",
    "doctorId": "123456",
    "patientId": "654321",
    "rating": 5,
    "comment": "Excellent doctor...",
    "date": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Create Multiple Reviews
**POST** `/reviews/multiple`

Bulk creation of reviews for testing or data migration.

**Request Body:**
```json
{
  "reviews": [
    {
      "doctorId": "123456",
      "patientId": "654321",
      "rating": 5,
      "comment": "Great experience"
    },
    {
      "doctorId": "123456",
      "patientId": "654322",
      "rating": 4,
      "comment": "Good doctor"
    }
  ]
}
```

### 3. Get Doctor Reviews
**GET** `/reviews/:doctorId`

Retrieves all reviews for a specific doctor.

**Response (200):**
```json
[
  {
    "reviewId": "REV001",
    "rating": 5,
    "comment": "Excellent doctor...",
    "date": "2024-01-15T10:30:00.000Z"
  }
]
```

### 4. Delete Review
**DELETE** `/reviews/:reviewId`

Removes a review and recalculates doctor's average rating.

---

## 🗄️ Database Models

### Doctor Model
```javascript
{
  doctorId: String (unique, auto-generated),
  name: String (required),
  phone: String (required, unique),
  email: String (required, validated),
  gender: String (enum: ["Male", "Female", "Other"]),
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  medicalReg: String (required),
  specialization: String (required),
  photo: String (optional),
  overview: String,
  averageRating: Number (0-5),
  password: String (encrypted),
  Organisation: String (required)
}
```

### Patient Model
```javascript
{
  patientId: String (unique, auto-generated),
  name: String (required),
  phone: String (required, validated),
  email: String (required, validated),
  gender: String (enum: ["Male", "Female", "Other"]),
  dateOfBirth: Date (required),
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  password: String (encrypted)
}
```

### Appointment Model
```javascript
{
  appointmentId: String (unique, auto-generated),
  patientId: String (required),
  doctorId: String (required),
  hospitalId: String (optional),
  date: Date (required),
  slotNumber: String (required),
  reason: String (required),
  appStatus: String (enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rescheduled', 'Incomplete']),
  consultStatus: String (enum: ['Offline', 'Online']),
  payStatus: String (enum: ['Paid', 'Unpaid']),
  MeetLink: String
}
```

### Review Model
```javascript
{
  reviewId: String (unique, auto-generated),
  doctorId: String (required),
  patientId: String (required),
  rating: Number (1-5, required),
  comment: String (required),
  date: Date (auto-generated)
}
```

---

## 🔐 Authentication & Security

### JWT Implementation
- **Token Generation**: Uses secret key for signing tokens
- **Token Validation**: Middleware validates tokens on protected routes
- **Password Security**: bcrypt with salt rounds for password hashing
- **Input Validation**: Mongoose schema validation and custom validation rules

### Security Features
- Password encryption using bcrypt
- JWT token-based authentication
- Input sanitization and validation
- CORS enabled for cross-origin requests
- Environment variable protection

---

## 📧 Email Notifications

### Email Service Features
- **Confirmation Emails**: Sent immediately after booking
- **Reminder Emails**: Scheduled 24 hours before appointment
- **Template-based**: Structured email content
- **Error Handling**: Graceful failure handling

### Email Configuration
```javascript
// Example email service configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}
```

---

## 🌍 Geospatial Features

### Location-based Search
- **MongoDB Geospatial Indexes**: Optimized for location queries
- **Distance Calculations**: Uses MongoDB's $near operator
- **Radius Search**: Configurable search radius (20km for doctors, 50km for top doctors)
- **Coordinate Validation**: Ensures valid latitude/longitude pairs

### Implementation
```javascript
// Example geospatial query
const doctors = await Doctor.find({
  location: {
    $near: {
      $geometry: { 
        type: "Point", 
        coordinates: [longitude, latitude] 
      },
      $maxDistance: 20000 // 20km in meters
    }
  }
});
```

---

## ⚠️ Error Handling

### Standard Error Responses
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid credentials)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

### Error Handling Strategy
- Centralized error handling middleware
- Consistent error response format
- Detailed logging for debugging
- User-friendly error messages

---

## 📊 Sample Data

The project includes sample data files for testing:
- `sample_data/sampleDoctors.json` - Test doctor records
- `sample_data/sampleHospitals.json` - Test hospital records
- `sample_data/samplePatients.json` - Test patient records

### Loading Sample Data
```bash
# Import sample data to MongoDB
mongoimport --db hams --collection doctors --file sample_data/sampleDoctors.json
mongoimport --db hams --collection hospitals --file sample_data/sampleHospitals.json
mongoimport --db hams --collection patients --file sample_data/samplePatients.json
```

---

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add feature description"`
6. Push to your branch: `git push origin feature-name`
7. Create a Pull Request

### Code Standards
- Follow existing code style and conventions
- Add comments for complex logic
- Include error handling for all endpoints
- Write clear commit messages
- Test all new features

### Testing
- Test all endpoints with valid and invalid data
- Verify authentication and authorization
- Check error handling scenarios
- Test email notifications
- Validate geospatial queries

---

## 📄 License

This project is licensed under the ISC License.

---

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review error logs and debugging information

---

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- Basic CRUD operations for all entities
- Authentication system
- Email notifications
- Geospatial search capabilities 