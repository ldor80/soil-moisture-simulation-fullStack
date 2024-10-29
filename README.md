# Soil Moisture Simulation

An interactive web application for simulating and visualizing soil moisture dynamics in a grid-based environment. This project helps users understand and analyze how various factors influence soil moisture levels over time.

## Features

- Interactive grid-based soil moisture simulation
- Real-time visualization with customizable color schemes
- Adjustable parameters:
  - Diffusion coefficient
  - Evapotranspiration rate
  - Irrigation rate
  - Moisture threshold
- Save and load simulation states
- Export simulation data in JSON and CSV formats
- Step-by-step simulation control
- Per-cell parameter customization

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Context for state management

### Backend
- Node.js
- Express
- PostgreSQL
- TypeScript
- Swagger for API documentation

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd soil-moisture-simulation
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
- Copy `.env.example` to `.env` in the backend directory
- Update the database connection details

5. Start the development servers:

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

## Documentation

Detailed documentation can be found in the `claudeDev_docs` directory:
- [User Guide](claudeDev_docs/UserGuide.md)
- [API Documentation](claudeDev_docs/APIDocumentation.md)
- [Technical Documentation](claudeDev_docs/techStack.md)
- [Deployment Guide](claudeDev_docs/DeploymentOptions.md)

## Contributing

Contributions are welcome! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
