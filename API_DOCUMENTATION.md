# HAMS Backend API Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Getting Started](#getting-started)
4. [API Configuration](#api-configuration)
5. [Authentication](#authentication)
6. [Data Models](#data-models)
7. [API Endpoints](#api-endpoints)
8. [Error Handling](#error-handling)
9. [Services](#services)
10. [Middlewares](#middlewares)

---

## Project Overview

**HAMS** (Hospital Appointment Management System) is a comprehensive backend application designed to manage healthcare services including:
- Patient registration and profile management
- Doctor registration and availability management
- Hospital registration and management
- Appointment booking, rescheduling, and cancellation
- Review and rating system
- Email notifications and appointment reminders
- Geolocation-based doctor search

**Base URL:** `http://localhost:3000`

---

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** (v5.1.0) | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** (v8.15.2) | ODM for MongoDB |
| **JWT** (jsonwebtoken v9.0.2) | Authentication |
| **bcrypt** (v6.0.0) | Password hashing |
| **Nodemailer** (v7.0.3) | Email service |
| **Multer** (v2.0.1) | File upload handling |
| **Cloudinary** (v2.7.0) | Image storage |
| **CORS** (v2.8.5) | Cross-origin resource sharing |
| **date-fns** (v4.1.0) | Date manipulation |
| **Firebase Admin** (v13.4.0) | Firebase integration |
| **node-cron** & **node-schedule** | Job scheduling |
| **Streamifier** (v0.1.1) | Stream conversion |

---

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/hams
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### CORS Configuration

Allowed Origins:
- `http://localhost:5173` (Development)
- `https://main.d2sjy3evn9ox1m.amplifyapp.com` (Production)

---

## API Configuration

### Base URL
```
http://localhost:3000
```

### Request Format
All requests should include:
- Content-Type: `application/json`
- Authorization: `Bearer <jwt_token>` (for protected routes)

### Response Format
Standard JSON response structure:
```json
{
  "message": "Success/Error message",
  "data": {},
  "error": null
}
```

---

## Authentication

### JWT Token

The application uses JWT (JSON Web Token) for authentication.

**Token Payload:**
```json
{
  "id": "user_id",
  "phone": "phone_number",
  "role": "doctor|patient|hospital",
  "name": "user_name",
  "email": "user_email",
  "photo": null,
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Expiry:** 7 days

**How to use:**
1. Include token in the Authorization header: `Authorization: Bearer <token>`
2. Token is automatically generated after signup/login
3. Protected routes require valid token

---

## Data Models

### 1. Patient Model

```javascript
{
  patientId: String (unique, auto-generated),
  name: String (required),
  phone: String (required, 10-digit, unique),
  email: String (required, unique),
  gender: String (required),
  dateOfBirth: Date (required),
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String
  },
  emergencyContact: {
    name: String,
    phone: String (10-digit),
    relation: String
  },
  password: String (hashed, required, min 6 chars),
  photo: {
    publicId: String,
    url: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Doctor Model

```javascript
{
  doctorId: Number (unique, auto-generated),
  name: String (required),
  phone: String (required, 10-digit, unique),
  email: String (required, unique),
  gender: String (enum: ["Male", "Female", "Other"]),
  location: {
    type: "Point" (GeoJSON),
    coordinates: [Number, Number] (longitude, latitude)
  },
  medicalReg: String (required),
  specialization: String (required),
  photo: {
    publicId: String,
    url: String
  },
  overview: String,
  availableSlots: Map<Date, Array<String>>,
  averageRating: Number (0-5, default: 3),
  reviewsCount: Number,
  basicFee: Number (default: 0),
  experience: Number (years, default: 0),
  password: String (hashed, required, min 6 chars),
  workingHours: {
    from: String (time format),
    to: String (time format)
  },
  Hospital: String (reference to hospital),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Hospital Model

```javascript
{
  hospitalId: String (unique, auto-generated),
  name: String (required),
  RegId: String (unique, required),
  phone: String (required),
  email: String (required),
  address: {
    addressLine: String,
    city: String,
    state: String,
    pincode: Number
  },
  location: {
    type: "Point" (GeoJSON),
    coordinates: [Number, Number] (longitude, latitude)
  },
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Appointment Model

```javascript
{
  appointmentId: String (unique, auto-generated),
  patientId: String (required),
  doctorId: Number (required),
  hospital: String,
  date: Date (required),
  slotNumber: String (required),
  reason: String (required),
  appStatus: String (enum: [
    'Requested',
    'Pending',
    'Confirmed',
    'Request for Rescheduling',
    'Rescheduled',
    'Completed',
    'Cancelled',
    'Rejected',
    'Incomplete'
  ], default: 'Requested'),
  consultStatus: String (enum: ['Offline', 'Online'], default: 'Offline'),
  payStatus: String (enum: ['Paid', 'Unpaid'], default: 'Unpaid'),
  prescription: String,
  reasonForReject: String,
  rescheduleReason: String,
  meetLink: String (Jitsi meet link for online consultations),
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Review Model

```javascript
{
  _id: ObjectId,
  doctorId: Number (required),
  patientId: String (required),
  rating: Number (1-5, required),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Reminder Model

```javascript
{
  _id: ObjectId,
  appointmentId: String (required),
  patientId: String (required),
  doctorId: Number (required),
  reminderTime: Date (required),
  sent: Boolean (default: false),
  createdAt: Date
}
```

---

## API Endpoints

### 1. Authentication Routes (`/auth`)

#### 1.1 Google Sign-In (Patient/Doctor)
```http
POST /auth/google
```

**Request Body:**
```json
{
  "idToken": "google_id_token"
}
```

**Response (201):**
```json
{
  "message": "Login/Signup successful",
  "user": { /* user object */ },
  "token": "jwt_token"
}
```

---

### 2. Patient Routes (`/patients`)

#### 2.1 Patient Sign-Up
```http
POST /patients/signup
```

**Request Body (multipart/form-data):**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "gender": "Male",
  "dateOfBirth": "1990-01-15",
  "password": "securePassword123",
  "street": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400001",
  "emergencyName": "Jane Doe",
  "emergencyPhone": "9876543211",
  "emergencyRelation": "Sister",
  "photo": [file]
}
```

**Response (201):**
```json
{
  "message": "Patient registered successfully",
  "patient": { /* patient object */ },
  "token": "jwt_token"
}
```

**Validation Rules:**
- Phone: Exactly 10 digits
- Email: Valid email format
- Password: Minimum 6 characters
- Date of Birth: Valid date format

---

#### 2.2 Patient Login
```http
POST /patients/login
```

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
  "patientId": "abc123",
  "token": "jwt_token"
}
```

**Error Responses:**
- 404: Patient not found
- 401: Invalid credentials
- 500: Server error

---

#### 2.3 Get Patient Profile
```http
GET /patients/profile
```

**Authentication:** Required ✅

**Response (200):**
```json
{
  "patientId": "abc123",
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "gender": "Male",
  "dateOfBirth": "1990-01-15",
  "address": { /* address */ },
  "emergencyContact": { /* emergency contact */ },
  "photo": { /* photo */ }
}
```

---

#### 2.4 Update Patient Profile
```http
PUT /patients/update-profile
```

**Authentication:** Required ✅

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543210",
  "email": "john.updated@example.com",
  "gender": "Male",
  "dateOfBirth": "1990-01-15",
  "password": "newPassword123",
  "address": {
    "street": "456 New St",
    "city": "Bangalore",
    "state": "Karnataka",
    "postalCode": "560001"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "9876543211",
    "relation": "Sister"
  }
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "patient": { /* updated patient */ }
}
```

---

#### 2.5 Get All Patient Appointments
```http
GET /patients/appointments
```

**Authentication:** Required ✅

**Response (200):**
```json
[
  {
    "appointmentId": "appt001",
    "doctorId": 123456,
    "doctorName": "Dr. Sharma",
    "reason": "General Checkup",
    "date": "2024-05-20T10:00:00Z",
    "slot": "10:00-10:30",
    "appStatus": "Confirmed",
    "prescription": "Take rest",
    "meetLink": "https://meet.jit.si/...",
    "consultStatus": "Online",
    "hospital": "Apollo Hospital"
  }
]
```

---

#### 2.6 Request Appointment Reschedule
```http
POST /patients/appointments/request-reschedule
```

**Authentication:** Required ✅

**Request Body:**
```json
{
  "appointmentId": "appt001"
}
```

**Response (200):**
```json
{
  "message": "Reschedule request sent to doctor",
  "appointment": { /* updated appointment */ }
}
```

---

#### 2.7 Cancel Appointment
```http
POST /patients/cancel-appointment
```

**Authentication:** Required ✅

**Request Body:**
```json
{
  "appointmentId": "appt001"
}
```

**Response (200):**
```json
{
  "message": "Appointment cancelled successfully"
}
```

---

### 3. Doctor Routes (`/doctors`)

#### 3.1 Doctor Sign-Up
```http
POST /doctors/signup
```

**Request Body (multipart/form-data):**
```json
{
  "name": "Dr. Sharma",
  "phone": "9876543210",
  "email": "dr.sharma@example.com",
  "gender": "Male",
  "location": "{ \"type\": \"Point\", \"coordinates\": [72.8479, 19.0144] }",
  "specialization": "Cardiology",
  "medicalReg": "MED123456",
  "password": "securePassword123",
  "Hospital": "Apollo Hospital",
  "basicFee": 500,
  "experience": 10,
  "workingHoursFrom": "09:00",
  "workingHoursTo": "18:00",
  "photo": [file]
}
```

**Response (201):**
```json
{
  "doctor": { /* doctor object */ },
  "token": "jwt_token"
}
```

---

#### 3.2 Doctor Login
```http
POST /doctors/login
```

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
  "token": "jwt_token"
}
```

---

#### 3.3 Get Nearby Doctors
```http
GET /doctors/nearby/:lat/:lon
```

**Parameters:**
- `lat`: Latitude (number)
- `lon`: Longitude (number)

**Query Parameters:**
- `maxDistance`: Maximum distance in meters (default: 200000m = 200km)

**Response (200):**
```json
[
  {
    "doctorId": 123456,
    "name": "Dr. Sharma",
    "phone": "9876543210",
    "email": "dr.sharma@example.com",
    "specialization": "Cardiology",
    "basicFee": 500,
    "experience": 10,
    "averageRating": 4.5,
    "location": { /* GeoJSON */ },
    "photo": { /* photo */ }
  }
]
```

---

#### 3.4 Get Top Doctors by Location
```http
GET /doctors/top/:lat/:lon
```

**Parameters:**
- `lat`: Latitude (number)
- `lon`: Longitude (number)

**Query Parameters:**
- `maxDistance`: Maximum distance in meters (default: 50000m = 50km)
- `limit`: Number of results (default: 10)

**Response (200):**
```json
{
  "doctors": [ /* sorted by averageRating descending */ ]
}
```

---

#### 3.5 Get Doctor Profile
```http
GET /doctors/profile
```

**Authentication:** Required ✅

**Response (200):**
```json
{
  "doctorId": 123456,
  "name": "Dr. Sharma",
  "phone": "9876543210",
  "email": "dr.sharma@example.com",
  "specialization": "Cardiology",
  "overview": "Experienced cardiologist",
  "availableSlots": { /* map of date: [slots] */ },
  "averageRating": 4.5,
  "basicFee": 500,
  "experience": 10,
  "photo": { /* photo */ }
}
```

---

#### 3.6 Get Public Doctor Profile
```http
GET /doctors/:doctorId/profile
```

**Parameters:**
- `doctorId`: Doctor ID (number)

**Response (200):**
```json
{
  "doctorId": 123456,
  "name": "Dr. Sharma",
  "phone": "9876543210",
  "email": "dr.sharma@example.com",
  "specialization": "Cardiology",
  "overview": "Experienced cardiologist",
  "averageRating": 4.5,
  "reviewsCount": 25,
  "basicFee": 500,
  "experience": 10,
  "workingHours": { "from": "09:00", "to": "18:00" },
  "photo": { /* photo */ }
}
```

---

#### 3.7 Edit Doctor Profile
```http
PUT /doctors/editProfile
```

**Authentication:** Required ✅

**Request Body (multipart/form-data):**
```json
{
  "name": "Dr. Sharma Updated",
  "overview": "Senior Cardiologist with 15 years experience",
  "basicFee": 600,
  "experience": 15,
  "photo": [file]
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "doctor": { /* updated doctor */ }
}
```

---

#### 3.8 Update Doctor Overview
```http
PUT /doctors/update/:id
```

**Parameters:**
- `id`: Doctor ID

**Request Body:**
```json
{
  "overview": "Updated professional summary"
}
```

**Response (200):**
```json
{
  "message": "Doctor overview updated",
  "doctor": { /* updated doctor */ }
}
```

---

#### 3.9 Update Available Slots
```http
POST /doctors/:doctorId/slots
```

**Authentication:** Required ✅

**Parameters:**
- `doctorId`: Doctor ID

**Request Body:**
```json
{
  "date": "2024-05-20",
  "slots": ["10:00-10:30", "10:30-11:00", "11:00-11:30"]
}
```

**Response (200):**
```json
{
  "message": "Slots updated successfully",
  "availableSlots": { /* updated slots */ }
}
```

---

#### 3.10 Get Available Slots
```http
GET /doctors/:doctorId/slots
```

**Parameters:**
- `doctorId`: Doctor ID

**Response (200):**
```json
{
  "doctorId": 123456,
  "availableSlots": {
    "2024-05-20": ["10:00-10:30", "10:30-11:00"],
    "2024-05-21": ["14:00-14:30", "14:30-15:00"]
  }
}
```

---

#### 3.11 Get Booked Slots
```http
GET /doctors/:doctorId/booked-slots
```

**Parameters:**
- `doctorId`: Doctor ID

**Response (200):**
```json
{
  "doctorId": 123456,
  "bookedSlots": {
    "2024-05-20": ["10:00-10:30", "11:00-11:30"],
    "2024-05-21": ["14:00-14:30"]
  }
}
```

---

#### 3.12 Get Doctor Appointments
```http
GET /doctors/:doctorId/appointments
```

**Parameters:**
- `doctorId`: Doctor ID

**Response (200):**
```json
{
  "appointments": [
    {
      "appointmentId": "appt001",
      "patientId": "pat001",
      "date": "2024-05-20T10:00:00Z",
      "slotNumber": "10:00-10:30",
      "reason": "General Checkup",
      "appStatus": "Confirmed"
    }
  ]
}
```

---

#### 3.13 Get Requested Appointments
```http
GET /doctors/requested-appointments
```

**Authentication:** Required ✅

**Response (200):**
```json
[
  {
    "appointmentId": "appt001",
    "patientId": "pat001",
    "patientName": "John Doe",
    "date": "2024-05-20T10:00:00Z",
    "reason": "General Checkup",
    "appStatus": "Requested"
  }
]
```

---

#### 3.14 Get Reschedule Requests
```http
GET /doctors/reschedule-requests
```

**Authentication:** Required ✅

**Response (200):**
```json
[
  {
    "appointmentId": "appt001",
    "patientName": "John Doe",
    "currentDate": "2024-05-20T10:00:00Z",
    "appStatus": "Request for Rescheduling"
  }
]
```

---

#### 3.15 Handle Reschedule Request
```http
POST /doctors/handle-reschedule
```

**Authentication:** Required ✅

**Request Body:**
```json
{
  "appointmentId": "appt001",
  "newDate": "2024-05-22",
  "newSlot": "14:00-14:30",
  "action": "approve|reject",
  "reason": "Reason for rejection (if applicable)"
}
```

**Response (200):**
```json
{
  "message": "Reschedule request handled",
  "appointment": { /* updated appointment */ }
}
```

---

### 4. Appointment Routes (`/appointments`)

#### 4.1 Book Appointment
```http
POST /appointments/book
```

**Authentication:** Required ✅

**Request Body:**
```json
{
  "date": "2024-05-20",
  "doctorId": 123456,
  "hospital": "Apollo Hospital",
  "slotNumber": "10:00-10:30",
  "reason": "General Checkup",
  "payStatus": "Unpaid",
  "consultStatus": "Online"
}
```

**Response (201):**
```json
{
  "message": "Appointment request submitted successfully",
  "appointment": { /* appointment object */ },
  "emailSent": true,
  "emailSentTo": "patient@example.com"
}
```

**Validation:**
- Reason is required and non-empty
- Cannot book appointments in the past
- consultStatus must be "Online" or "Offline"

---

#### 4.2 Respond to Appointment Request
```http
PUT /appointments/respond
```

**Authentication:** Required ✅

**Request Body:**
```json
{
  "appointmentId": "appt001",
  "action": "approve|reject",
  "rejectionReason": "Not available at this time (optional)"
}
```

**Response (200):**
```json
{
  "message": "Appointment response recorded",
  "appointment": { /* updated appointment */ }
}
```

---

#### 4.3 Reschedule Appointment
```http
PUT /appointments/reschedule
```

**Request Body:**
```json
{
  "appointmentId": "appt001",
  "newDate": "2024-05-22",
  "newSlot": "14:00-14:30",
  "reason": "Rescheduling reason"
}
```

**Response (200):**
```json
{
  "message": "Appointment rescheduled successfully",
  "appointment": { /* updated appointment */ }
}
```

---

#### 4.4 Cancel Appointment
```http
PUT /appointments/cancel
```

**Request Body:**
```json
{
  "appointmentId": "appt001",
  "reason": "Cancellation reason"
}
```

**Response (200):**
```json
{
  "message": "Appointment cancelled successfully"
}
```

---

#### 4.5 Update Appointment Status
```http
PUT /appointments/update-status/:appointmentId
```

**Parameters:**
- `appointmentId`: Appointment ID

**Request Body:**
```json
{
  "status": "Completed|Cancelled|Rejected|Incomplete",
  "prescription": "Prescription details (if applicable)"
}
```

**Response (200):**
```json
{
  "message": "Appointment status updated",
  "appointment": { /* updated appointment */ }
}
```

---

#### 4.6 Get Pending Appointments by Date
```http
GET /appointments/pending/:date
```

**Authentication:** Required ✅

**Parameters:**
- `date`: Date in format YYYY-MM-DD

**Response (200):**
```json
[
  {
    "appointmentId": "appt001",
    "patientId": "pat001",
    "date": "2024-05-20T10:00:00Z",
    "appStatus": "Requested"
  }
]
```

---

#### 4.7 Get Previous Appointments
```http
GET /appointments/previous
```

**Authentication:** Required ✅

**Response (200):**
```json
[
  {
    "appointmentId": "appt001",
    "doctorId": 123456,
    "date": "2024-04-20T10:00:00Z",
    "appStatus": "Completed",
    "prescription": "Take rest"
  }
]
```

---

#### 4.8 Get All Appointments by Doctor
```http
GET /appointments/all/:doctorId
```

**Authentication:** Required ✅

**Parameters:**
- `doctorId`: Doctor ID

**Response (200):**
```json
[
  {
    "appointmentId": "appt001",
    "patientId": "pat001",
    "date": "2024-05-20T10:00:00Z",
    "appStatus": "Confirmed"
  }
]
```

---

#### 4.9 Get Appointment Details
```http
GET /appointments/detail
```

**Authentication:** Required ✅

**Query Parameters:**
- `appointmentId`: Appointment ID

**Response (200):**
```json
{
  "appointmentId": "appt001",
  "patientId": "pat001",
  "doctorId": 123456,
  "date": "2024-05-20T10:00:00Z",
  "slotNumber": "10:00-10:30",
  "reason": "General Checkup",
  "appStatus": "Confirmed",
  "consultStatus": "Online",
  "payStatus": "Unpaid",
  "meetLink": "https://meet.jit.si/..."
}
```

---

#### 4.10 Get Appointments by Patient
```http
GET /appointments/patient
```

**Authentication:** Required ✅

**Response (200):**
```json
[
  {
    "appointmentId": "appt001",
    "doctorId": 123456,
    "doctorName": "Dr. Sharma",
    "date": "2024-05-20T10:00:00Z",
    "appStatus": "Confirmed"
  }
]
```

---

### 5. Hospital Routes (`/hospitals`)

#### 5.1 Hospital Sign-Up
```http
POST /hospitals/signup
```

**Request Body:**
```json
{
  "name": "Apollo Hospital",
  "RegId": "REG123456",
  "phone": "9876543210",
  "email": "apollo@hospital.com",
  "password": "securePassword123",
  "addressLine": "123 Medical St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "location": {
    "coordinates": [72.8479, 19.0144]
  }
}
```

**Response (201):**
```json
{
  "message": "Hospital registered successfully",
  "hospital": { /* hospital object */ },
  "token": "jwt_token"
}
```

**Validation:**
- RegId must be unique
- Coordinates must be valid [longitude, latitude]

---

#### 5.2 Hospital Login
```http
POST /hospitals/login
```

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
  "token": "jwt_token"
}
```

---

#### 5.3 Get Nearby Hospitals
```http
GET /hospitals/getAll/:lat/:lon
```

**Parameters:**
- `lat`: Latitude (number)
- `lon`: Longitude (number)

**Response (200):**
```json
[
  {
    "hospitalId": "hosp001",
    "name": "Apollo Hospital",
    "phone": "9876543210",
    "email": "apollo@hospital.com",
    "address": { /* address */ },
    "location": { /* GeoJSON */ }
  }
]
```

---

### 6. Review Routes (`/reviews`)

#### 6.1 Create Review
```http
POST /reviews/
```

**Request Body:**
```json
{
  "doctorId": 123456,
  "patientId": "pat001",
  "rating": 5,
  "comment": "Excellent doctor, very professional"
}
```

**Response (201):**
```json
{
  "message": "Review added successfully",
  "review": { /* review object */ }
}
```

**Validation:**
- Rating must be between 1-5
- Doctor must exist

---

#### 6.2 Create Multiple Reviews
```http
POST /reviews/multiple
```

**Request Body:**
```json
{
  "reviews": [
    {
      "doctorId": 123456,
      "patientId": "pat001",
      "rating": 5,
      "comment": "Excellent"
    },
    {
      "doctorId": 123456,
      "patientId": "pat002",
      "rating": 4,
      "comment": "Good"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "All reviews added successfully",
  "reviews": [ /* array of reviews */ ]
}
```

---

#### 6.3 Get Reviews by Doctor
```http
GET /reviews/:doctorId
```

**Parameters:**
- `doctorId`: Doctor ID

**Response (200):**
```json
[
  {
    "_id": "ObjectId",
    "doctorId": 123456,
    "patientId": {
      "patientId": "pat001",
      "name": "John Doe",
      "photo": { /* photo */ }
    },
    "rating": 5,
    "comment": "Excellent doctor",
    "createdAt": "2024-05-01T10:00:00Z"
  }
]
```

---

#### 6.4 Get Reviews by Patient
```http
GET /reviews/patient/:patientId
```

**Parameters:**
- `patientId`: Patient ID

**Response (200):**
```json
[
  {
    "_id": "ObjectId",
    "doctorId": 123456,
    "patientId": "pat001",
    "rating": 5,
    "comment": "Excellent doctor",
    "createdAt": "2024-05-01T10:00:00Z"
  }
]
```

---

#### 6.5 Update Review
```http
PUT /reviews/:reviewId
```

**Parameters:**
- `reviewId`: Review ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Good service"
}
```

**Response (200):**
```json
{
  "message": "Review updated successfully",
  "review": { /* updated review */ }
}
```

---

#### 6.6 Delete Review
```http
DELETE /reviews/:reviewId
```

**Parameters:**
- `reviewId`: Review ID (MongoDB ObjectId)

**Response (200):**
```json
{
  "message": "Review deleted successfully"
}
```

---

## Error Handling

### Standard Error Responses

**400 - Bad Request**
```json
{
  "message": "Invalid request parameters or validation failed"
}
```

**401 - Unauthorized**
```json
{
  "message": "Token Required" | "Invalid Token"
}
```

**403 - Forbidden**
```json
{
  "message": "Invalid Token"
}
```

**404 - Not Found**
```json
{
  "message": "Patient/Doctor/Hospital/Appointment not found"
}
```

**409 - Conflict**
```json
{
  "message": "Phone number already exists" | "Doctor already exists"
}
```

**500 - Internal Server Error**
```json
{
  "message": "error details"
}
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Token Required" | No authorization header | Include Authorization header with token |
| "Invalid Token" | Expired or malformed token | Obtain new token by logging in |
| "Phone already exists" | Phone number in use | Use different phone number |
| "Invalid phone format" | Phone is not 10 digits | Phone must be exactly 10 digits |
| "Invalid email format" | Email doesn't match pattern | Provide valid email address |
| "Cannot book in past" | Appointment date is in past | Book for future dates only |

---

## Services

### 1. Email Service

**File:** `services/emailService.js`

**Provides:**
- `sendConfirmationEmail()` - Send appointment confirmation
- `sendReminderEmail()` - Send appointment reminder
- `sendCancellationEmail()` - Send cancellation notification
- `sendRescheduleEmail()` - Send reschedule notification
- `sendAppointmentResponseEmail()` - Send approval/rejection response

**Configuration:**
- Provider: Nodemailer
- Email: Set in `.env` as `EMAIL_USER`
- Password: Set in `.env` as `EMAIL_PASSWORD`

---

### 2. Cloudinary Service

**File:** `services/cloudinary.js`

**Provides:**
- `uploadToCloudinaryFromBuffer()` - Upload images to Cloudinary

**Usage:**
- Stores profile pictures for patients and doctors
- Supports file upload via Multer

**Configuration:**
- Set Cloudinary credentials in `.env`

---

### 3. Reminder Service

**File:** `services/reminderService.js`

**Provides:**
- `startReminderCronJob()` - Starts cron job for appointment reminders
- `scheduleReminderInDB()` - Schedule reminder for appointment
- `cancelReminder()` - Cancel scheduled reminder

**Features:**
- Automatically sends email reminders before appointments
- Runs via node-cron
- Stores reminder timestamps in database

---

---

## Middlewares

### 1. JWT Authentication Middleware

**File:** `middlewares/JWTmiddleware.js`

**Functions:**

#### `authenticateToken()`
Verifies JWT token and attaches user info to request

**Usage:**
```javascript
router.get('/profile', authenticateToken, controller.profile);
```

**Protection:** Routes requiring authentication should use this middleware

**Token Validation:**
- Checks for token in `Authorization` header
- Verifies token signature
- Validates token expiry
- Attaches user object to `req.user`

#### `generateToken()`
Generates JWT token for authenticated users

**Payload:**
```javascript
{
  id: userIdOrDoctorId,
  phone: phoneNumber,
  role: 'doctor|patient|hospital',
  name: userName,
  email: userEmail,
  photo: userPhoto
}
```

**Expiry:** 7 days

---

### 2. Multer Middleware

**File:** `middlewares/multer.js`

**Functionality:**
- Handles file uploads
- Validates file types
- Limits file size
- Stores files temporarily

**Usage:**
```javascript
router.post('/signup', upload.single("photo"), authController.patientSignup);
```

**Configuration:**
- Max file size: Configurable
- Supported types: Image files (jpeg, png, gif, etc.)
- Field name: "photo"

---

## Project Structure

```
HAMS_Backend/
├── controllers/
│   ├── appointmentController.js
│   ├── authController.js
│   ├── doctorControllers.js
│   ├── hospitalControllers.js
│   ├── patientController.js
│   └── reviewController.js
├── middlewares/
│   ├── JWTmiddleware.js
│   └── multer.js
├── models/
│   ├── appointmentModel.js
│   ├── doctorModel.js
│   ├── hospitalModel.js
│   ├── patientModel.js
│   ├── reminderModel.js
│   └── reviewModel.js
├── routes/
│   ├── appointmentRoutes.js
│   ├── authRoutes.js
│   ├── doctorRoutes.js
│   ├── hospitalRoutes.js
│   ├── patientRoutes.js
│   └── reviewRoutes.js
├── services/
│   ├── cloudinary.js
│   ├── emailService.js
│   └── reminderService.js
├── config/
│   └── email.js
├── sample_data/
│   └── [Sample JSON files]
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## Common Use Cases

### 1. Patient Flow
1. **Sign up** → POST `/patients/signup`
2. **Log in** → POST `/patients/login`
3. **Search doctors** → GET `/doctors/nearby/:lat/:lon`
4. **View doctor profile** → GET `/doctors/:doctorId/profile`
5. **Check available slots** → GET `/doctors/:doctorId/slots`
6. **Book appointment** → POST `/appointments/book`
7. **View appointments** → GET `/patients/appointments`
8. **Leave review** → POST `/reviews/`

### 2. Doctor Flow
1. **Sign up** → POST `/doctors/signup`
2. **Log in** → POST `/doctors/login`
3. **Set available slots** → POST `/doctors/:doctorId/slots`
4. **View pending requests** → GET `/doctors/requested-appointments`
5. **Respond to request** → PUT `/appointments/respond`
6. **View all appointments** → GET `/appointments/all/:doctorId`
7. **View profile** → GET `/doctors/profile`

### 3. Appointment Lifecycle
```
Requested → Confirmed → Completed
         ↘ Rejected
           
Request for Rescheduling → Rescheduled → Completed
                         ↘ Rejected

Any Status → Cancelled (except Completed)
```

---

## Response Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Token validation failed |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate phone/email |
| 500 | Server Error | Database/system error |

---

## Testing

### Using Postman/cURL

**1. Patient Signup:**
```bash
curl -X POST http://localhost:3000/patients/signup \
  -F "name=John Doe" \
  -F "phone=9876543210" \
  -F "email=john@example.com" \
  -F "gender=Male" \
  -F "dateOfBirth=1990-01-15" \
  -F "password=password123" \
  -F "street=123 Main" \
  -F "city=Mumbai" \
  -F "state=Maharashtra" \
  -F "postalCode=400001" \
  -F "emergencyName=Jane" \
  -F "emergencyPhone=9876543211" \
  -F "emergencyRelation=Sister" \
  -F "photo=@profile.jpg"
```

**2. Doctor Signup:**
```bash
curl -X POST http://localhost:3000/doctors/signup \
  -F "name=Dr. Sharma" \
  -F "phone=9876543220" \
  -F "email=dr.sharma@example.com" \
  -F "gender=Male" \
  -F "specialization=Cardiology" \
  -F "medicalReg=MED123456" \
  -F "password=password123" \
  -F "Hospital=Apollo" \
  -F "basicFee=500" \
  -F "experience=10" \
  -F "workingHoursFrom=09:00" \
  -F "workingHoursTo=18:00" \
  -F "location={\"type\":\"Point\",\"coordinates\":[72.8479,19.0144]}" \
  -F "photo=@doctor.jpg"
```

**3. Book Appointment (with token):**
```bash
curl -X POST http://localhost:3000/appointments/book \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-05-20",
    "doctorId": 123456,
    "hospital": "Apollo",
    "slotNumber": "10:00-10:30",
    "reason": "Checkup",
    "consultStatus": "Online"
  }'
```

---

## Troubleshooting

### Issue: "MongoDB connection error"
**Solution:** Check MONGO_URL in .env file and ensure MongoDB service is running

### Issue: "Token Required" or "Invalid Token"
**Solution:** Ensure Authorization header includes "Bearer " prefix: `Authorization: Bearer <token>`

### Issue: "Phone number already exists"
**Solution:** Use unique phone number for new registration

### Issue: Email not sending
**Solution:** Verify EMAIL_USER and EMAIL_PASSWORD in .env, check SMTP settings

### Issue: Photo upload fails
**Solution:** Ensure Cloudinary credentials are correct in .env

---

## Security Best Practices

1. **Passwords:** Always hashed with bcrypt before storing
2. **Tokens:** Expire after 7 days
3. **CORS:** Restricted to specific origins
4. **Input Validation:** Phone, email formats validated
5. **File Uploads:** Only images allowed via Multer
6. **Authentication:** JWT tokens required for sensitive operations

---

## Future Enhancements

- [ ] Payment Gateway Integration
- [ ] SMS Notifications
- [ ] Real-time Chat
- [ ] Video Consultation
- [ ] Advanced Analytics
- [ ] Mobile App API
- [ ] Prescription Management
- [ ] Patient Medical History

---

## Support & Contact

For issues or questions, please contact the development team or create an issue in the repository.

---

**Last Updated:** May 15, 2024
**Version:** 1.0.0
