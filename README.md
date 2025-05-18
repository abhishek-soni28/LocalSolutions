# Local Solutions

Local Solutions is a community-based platform that connects local residents with businesses and service providers in their area. The platform allows users to post problems, offer solutions, and connect with local businesses.

## Features

- User authentication and authorization
- Post creation and management
- Comment system
- Business profiles
- Location-based search
- Real-time notifications
- Responsive design

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security with JWT authentication
- Spring Data JPA
- PostgreSQL
- Hibernate
- Maven

### Frontend
- React 18
- Material-UI
- Redux for state management
- React Router
- Axios for API calls

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL 13 or higher
- Maven 3.8 or higher

### Database Setup
1. Create a PostgreSQL database named `localsolutions`
2. The application will automatically create the necessary tables on startup

### Backend Setup
1. Clone the repository
2. Navigate to the project root directory
3. Configure the database connection in `src/main/resources/application.properties`
4. Build the project: `mvn clean install`
5. Run the application: `mvn spring-boot:run`

The backend API will be available at `http://localhost:8080/api`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

The frontend application will be available at `http://localhost:3000`

## API Documentation

API documentation is available at `http://localhost:8080/api/swagger-ui.html` when the application is running.

## Environment Variables

The following environment variables can be set to configure the application:

### Backend
- `DB_URL`: Database URL
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT token generation
- `MAIL_HOST`: SMTP host for email sending
- `MAIL_PORT`: SMTP port
- `MAIL_USERNAME`: Email username
- `MAIL_PASSWORD`: Email password

### Frontend
- `REACT_APP_API_URL`: Backend API URL

## Project Structure

### Backend
- `src/main/java/com/localsolutions`: Root package
  - `config`: Configuration classes
  - `controller`: REST controllers
  - `dto`: Data Transfer Objects
  - `exception`: Custom exceptions and error handling
  - `model`: Entity classes
  - `repository`: Data access layer
  - `security`: Security configuration and JWT handling
  - `service`: Business logic
  - `util`: Utility classes

### Frontend
- `src`: Source code
  - `api`: API client configuration
  - `components`: Reusable UI components
  - `context`: React context providers
  - `hooks`: Custom React hooks
  - `pages`: Page components
  - `services`: Service layer for API calls
  - `store`: Redux store configuration and slices

## License

This project is licensed under the MIT License - see the LICENSE file for details.
