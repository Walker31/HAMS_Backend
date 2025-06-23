# HAMS Backend

## Overview
HAMS Backend is a Node.js/Express REST API for a Healthcare Appointment Management System. It manages doctors, patients, hospitals, appointments, and reviews, and provides email notifications for appointment confirmations and reminders.

---

## Directory Structure

```
HAMS_Backend/
  ├── config/              # Configuration files (e.g., email)
  ├── controllers/         # Route handler logic for each domain
  ├── middlewares/         # Express middlewares (e.g., JWT auth)
  ├── models/              # Mongoose models for MongoDB collections
  ├── routes/              # Express route definitions
  ├── sample_data/         # Example data for doctors, hospitals, patients
  ├── scripts/             # Utility scripts (e.g., create test email accounts)
  ├── services/            # Business logic (e.g., email sending)
  ├── server.js            # Main entry point
  ├── package.json         # Project metadata and dependencies
```

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd HAMS_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory.
   - Add your MongoDB connection string:
     ```
     MONGO_URL=mongodb://localhost:27017/hams
     ```

4. **Run the server**
   - For development (with auto-reload):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

---

## Main Features

- Doctor, Patient, and Hospital registration and authentication
- Book, reschedule, cancel, and delete appointments
- Email notifications for appointment confirmations and reminders
- Review system for doctors
- Search for nearby doctors and hospitals

---

## API Endpoints

### Doctor Routes (`/doctors`)
- `POST /login` — Doctor login
- `POST /signup` — Doctor registration
- `GET /nearby/:lat/:lon` — List doctors near a location
- `GET /top/:lat/:lon` — Top-rated doctors near a location
- `GET /:doctorId/appointments` — Appointments for a doctor
- `GET /:doctorId/profile` — Doctor profile
- `PUT /update/:id` — Update doctor overview

### Patient Routes (`/patients`)
- `POST /login` — Patient login
- `POST /signup` — Patient registration

### Hospital Routes (`/hospitals`)
- `POST /signup` — Hospital registration
- `GET /getAll/:lat/:lon` — List hospitals near a location

### Appointment Routes (`/appointments`)
- `POST /book` — Book an appointment
- `DELETE /delete` — Delete an appointment
- `PUT /reschedule` — Reschedule an appointment
- `PUT /cancel` — Cancel an appointment
- `PUT /update-status/:appId` — Update appointment status
- `GET /pending/:date` — List pending appointments for a date
- `GET /previous` — List previous appointments
- `GET /patient/:patientId` — Appointments for a patient

### Appointment Email Routes (`/appointmentsEmail`)
- `POST /book` — Book an appointment, send confirmation and schedule reminder email

### Review Routes (`/reviews`)
- `POST /` — Create a review
- `POST /multiple` — Create multiple reviews
- `GET /:doctorId` — Get all reviews for a doctor
- `DELETE /:reviewId` — Delete a review

---

## Models

- **Doctor**: doctorId, name, phone, email, gender, location, medicalReg, specialization, photo, overview, averageRating, password, Organisation
- **Patient**: name, phone, email, gender, dateOfBirth, address, emergencyContact, password
- **Hospital**: name, address, location, etc.
- **Appointment**: patient, doctor, date, time, status, etc.
- **Review**: doctor, patient, rating, comment, etc.

---

## Contribution Guidelines

- Fork the repository and create your branch from `main`.
- Ensure code follows the existing style and conventions.
- Write clear commit messages.
- Test your changes before submitting a pull request.

---

## License

ISC 