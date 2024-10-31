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

## Visualization & Data Analysis

### Real-time Visualization
- **Color Schemes**
  - Default: Blue gradient representing moisture levels
  - Grayscale: Alternative visualization for accessibility

- **Display Options**
  - Grid values: Show numerical moisture levels
  - Tap status indicators: Visual feedback for irrigation points
  - Parameter overlays: Display cell-specific parameters

### Data Export
- **JSON Format**
  - Complete simulation state
  - Parameter history
  - Cell-specific configurations
  - User actions log

- **CSV Format**
  - Time series data
  - Per-cell moisture levels
  - Parameter changes
  - Statistical analysis ready

### Analysis Tools
- Time-step navigation
- Parameter change tracking
- Moisture level history
- Irrigation event logging

## Simulation Parameters

### Global Parameters
- **Diffusion Coefficient** (0.0 - 1.0)
  - Controls how quickly moisture spreads between cells
  - Higher values mean faster moisture movement
  - Lower values result in more localized moisture retention

- **Evapotranspiration Rate** (0.0 - 1.0)
  - Rate at which moisture is lost to the environment
  - Represents combined effect of evaporation and plant transpiration
  - Higher values simulate hotter/drier conditions

- **Irrigation Rate** (0.0 - 1.0)
  - Rate of water addition when irrigation is active
  - Controls how quickly moisture levels increase
  - Affects the impact of active irrigation points

- **Moisture Threshold** (0.0 - 1.0)
  - Target moisture level for automatic irrigation
  - System activates irrigation when moisture falls below this level
  - Helps maintain optimal soil moisture conditions

### Per-Cell Customization
Each cell in the grid can have individual parameter values, allowing for:
- Variable soil conditions across the field
- Different irrigation zones
- Localized environmental conditions
- Custom moisture management strategies

## Current Development Status

### Active Features
- ✅ Core simulation functionality
- ✅ Parameter management
- ✅ Data export (JSON/CSV)
- ✅ Visualization tools
- ✅ State management
- ✅ Database integration

### In Development
- 🔄 Performance optimizations
- 🔄 Advanced testing suite
- 🔄 User authentication system (currently using default test user)

### Known Limitations
- Authentication system uses a default user (ID: 1) for testing purposes
- Cross-platform compatibility considerations for native modules
- Some features may require additional optimization for large datasets
- Simulation loading functionality is currently not operational
- Parameter changes (both global and per-cell) after simulation start may not work as expected:
  - Changes may not properly affect the simulation behavior
  - Exported data files may not accurately reflect parameter modifications
  - It's recommended to set all parameters before starting the simulation

## Project Structure

```
soil-moisture-simulation/
├── app/                          # Next.js frontend application
│   ├── components/              # Reusable React components
│   ├── contexts/               # React context providers
│   ├── fonts/                  # Custom fonts
│   ├── load-simulation/        # Simulation loading page
│   ├── setting/               # Settings page
│   ├── setup/                 # Initial setup page
│   └── simulation/            # Main simulation page
├── backend/                     # Express backend application
│   ├── __tests__/             # Backend tests
│   ├── middleware/            # Express middlewares
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   └── sql/                   # Database initialization scripts
├── claudeDev_docs/             # Project documentation
│   ├── sprintDocs/            # Sprint documentation
│   └── userInstructions/      # User guides
├── components/                 # Shared UI components
│   └── ui/                    # Shadcn UI components
├── contexts/                  # Shared context providers
└── lib/                      # Utility functions
```

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
- Docker for containerization

## Getting Started

### Prerequisites
- Docker Desktop installed and running (required for both Windows and Mac)
  - Includes Docker Engine and Docker Compose
  - Must be started before running the application
- Node.js (v14 or later)
- npm or yarn

### First-Time Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd soil-moisture-simulation-fullStack
```

2. Start Docker Desktop and ensure it's running

3. Start the database and backend services:
```bash
docker-compose up --build
```

4. In a new terminal, install dependencies (only needed for first-time setup):
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

5. Start the backend development server:
```bash
# In the backend directory
cd backend
npm run dev
```

6. In a new terminal, start the frontend development server:
```bash
# In the project root directory
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

### Subsequent Runs

1. Ensure Docker Desktop is running

2. Start the database and backend services:
```bash
docker-compose up --build
```

3. In a new terminal, start the backend server:
```bash
cd backend
npm run dev
```

4. In another new terminal, start the frontend:
```bash
npm run dev
```

### Development Setup

#### Configuration

All necessary configuration is handled through docker-compose.yml. No additional environment setup is required. The backend service is configured with these default settings:

```yaml
# From docker-compose.yml
environment:
  DB_HOST: db
  DB_PORT: 5432
  DB_NAME: soil_irrigation_simulator
  DB_USER: postgres
  DB_PASSWORD: postgres
  JWT_SECRET: your_jwt_secret_key
```

#### Database

The database schema is automatically initialized when the containers start. The SQL scripts are located in:
- `backend/sql/01_create_users_table.sql`
- `backend/sql/02_create_simulations_table.sql`

A default user (ID: 1) is automatically created for testing purposes.


### Troubleshooting

#### Docker Issues

1. If you see "invalid ELF header" errors:
```
Error: /usr/src/app/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node: invalid ELF header
```
This is a known issue with Node native modules between different CPU architectures. To resolve:
```bash
# Clean up containers and volumes
docker-compose down -v

# Rebuild with clean npm install
docker-compose up --build
```

2. If database tables are not created:
```
ERROR: relation "users" does not exist
```
This usually means the SQL initialization scripts didn't run. To resolve:
```bash
# Remove existing volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

3. If ports are already in use:
```
Error: listen EADDRINUSE: address already in use :::3000
```
Check for and stop any running containers or services using the same ports:
```bash
# List running containers
docker ps

# Stop specific container
docker stop <container-id>

# Or stop all containers
docker stop $(docker ps -a -q)
```

#### Frontend Issues

1. If you see module resolution errors:
```bash
# Clean npm cache and node_modules
rm -rf node_modules
npm cache clean --force
npm install
```

2. If changes are not reflecting:
```bash
# Hard refresh the browser cache
# Windows/Linux: Ctrl + F5
# macOS: Cmd + Shift + R
```

## Development Notes

### Authentication System
- Currently using a simplified authentication system with a default user
- Authentication middleware and JWT infrastructure are in place but not actively enforcing security
- Future updates will implement full user authentication and management

### Cross-Platform Development
- Project supports both ARM and x86 architectures
- Native modules (like bcrypt) are currently disabled to ensure cross-platform compatibility
- Future updates will implement proper cross-platform build configurations

### Performance Considerations
- Large datasets may require performance optimization
- Consider using smaller test datasets during development
- Monitor browser memory usage when working with extensive simulation histories

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
