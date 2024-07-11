# Event Management System Backend (Intixel Fullstack Task)

## Description

This is the backend part of the Event Management System. It provides RESTful API endpoints for user management, event management, and comment management. It is built using Node.js, Express, and MongoDB.

## Configuration

You will need to create `.env` file in the root directory including these environemt variables (MONGO_URI , JWT_SECRET)

## Scripts

- `start`: Start the application
    ```bash
    npm start
    ```

- `dev`: Start the application using nodemon for automatic restart on file changes
    ```bash
    npm run dev
    ```

## API Endpoints

### User Routes

- **Register User**: `POST /api/users/register`
- **Login User**: `POST /api/users/login`
- **Update User Profile**: `PUT /api/users/profile` (Protected)

### Event Routes

- **Search Events**: `GET /api/events/search`
- **Create Event**: `POST /api/events` (Protected)
- **Get All Events**: `GET /api/events`
- **Get Event By ID**: `GET /api/events/:id`
- **Update Event**: `PUT /api/events/:id` (Protected)
- **Delete Event**: `DELETE /api/events/:id` (Protected)
- **Add Attendee to Event**: `POST /api/events/:id/attend` (Protected)
- **Remove Attendee from Event**: `DELETE /api/events/:id/attend` (Protected)

### Comment Routes

- **Create Comment**: `POST /api/comments` (Protected)
- **Get Comments By Event ID**: `GET /api/comments/event/:eventID`
- **Update Comment**: `PUT /api/comments/:id` (Protected)
- **Delete Comment**: `DELETE /api/comments/:id` (Protected)

## Models

### User Model
- The User model represents a user in the system. It includes attributes such as name, email, password, role, age, gender, profile picture URL, country, and city. The password is encrypted before saving the user.

### Event Model
- The Event model represents an event in the system. It includes attributes such as name, description, location, date and time, organizer ID, and a list of attendees.

### Comment Model
- The Comment model represents a comment made on an event. It includes attributes such as user ID, event ID, comment text, and the date it was created.