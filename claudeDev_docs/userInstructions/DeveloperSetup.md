# Developer Setup Guide

This guide will walk you through setting up and running the Soil Irrigation Simulator project locally.

## Prerequisites

- Node.js (v14 or later)
- npm (usually comes with Node.js)
- Docker and Docker Compose
- Git

## Setup Steps

1. Clone the repository:
   ```
   git clone <repository-url>
   cd soil-irrigation-simulator
   ```

2. Install dependencies:
   ```
   cd backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following content:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=soil_irrigation_simulator
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=your_jwt_secret_key
   ```
   Note: In a production environment, you would use more secure credentials.

4. Start the PostgreSQL database using Docker:
   ```
   docker-compose up -d db
   ```

5. Run database migrations (if any):
   Currently, we don't have automated migrations. You need to manually create the users table. Connect to the PostgreSQL database and run the SQL script in `backend/sql/create_users_table.sql`.

6. Start the backend server:
   ```
   npm run dev
   ```

7. The server should now be running at `http://localhost:3000`. You can access the API documentation at `http://localhost:3000/api-docs`.

## Development Workflow

- The backend code is in the `backend` directory.
- Make changes to the TypeScript files in the `backend` directory.
- The `npm run dev` command uses `nodemon`, which will automatically restart the server when you make changes.
- Run tests using `npm test`.

## Using the API

You can use tools like Postman or curl to interact with the API endpoints:

1. Register a new user:
   ```
   POST http://localhost:3000/api/users/register
   Content-Type: application/json

   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. Login:
   ```
   POST http://localhost:3000/api/users/login
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. Use the returned token for authenticated requests:
   ```
   GET http://localhost:3000/api/protected
   Authorization: Bearer <your-token-here>
   ```

## Troubleshooting

- If you encounter any issues with the database connection, make sure the PostgreSQL container is running (`docker ps`).
- Check the console output for any error messages.
- Ensure all environment variables are correctly set in your `.env` file.

Remember to never commit sensitive information like passwords or API keys to the repository. Always use environment variables for such data.
