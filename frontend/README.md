# LocalSolutions Frontend

This is the frontend application for LocalSolutions, a platform connecting end users with local business solutions.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
REACT_APP_GA_TRACKING_ID=your_ga_tracking_id
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Runs the test suite
- `npm run lint`: Runs ESLint
- `npm run format`: Formats code using Prettier
- `npm run analyze`: Analyzes bundle size
- `npm run cypress:open`: Opens Cypress test runner
- `npm run cypress:run`: Runs Cypress tests in headless mode

## Development

The project uses:
- React 18
- Material-UI for components
- Redux Toolkit for state management
- React Router for routing
- Formik and Yup for forms
- i18next for internationalization
- Axios for API calls
- Socket.IO for WebSocket communication

## Code Quality

- ESLint for linting
- Prettier for code formatting
- Husky for git hooks
- Cypress for E2E testing

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── hooks/         # Custom React hooks
  ├── pages/         # Page components
  ├── services/      # API services
  ├── store/         # Redux store
  ├── styles/        # Global styles
  ├── utils/         # Utility functions
  └── i18n/          # Internationalization
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is licensed under the MIT License. 