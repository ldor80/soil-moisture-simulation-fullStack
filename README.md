# Soil Moisture Simulation

## Overview

An interactive simulation for modeling and visualizing soil moisture dynamics, featuring both global and per-cell parameter management for precise control over moisture behavior.

## Recent Updates

### New Features
- Per-cell parameter customization
- Enhanced visualization with default value display
- Improved cell details dialog with parameter controls
- "Reset All Cells to Global Parameters" functionality
- Automatic save prompt before export operations

### Improvements
- Enhanced grid initialization and reset functionality
- Improved state management and consistency
- Better synchronization between grid and history states
- More intuitive parameter controls
- Enhanced data export reliability

For a complete list of changes, see the [Changelog](claudeDev_docs/CHANGELOG.md).

## Features

### Core Functionality
- Interactive grid-based soil moisture simulation
- Real-time visualization of moisture levels
- Step-by-step simulation control (forward and backward)
- Save and load simulation states
- Export simulation data in JSON and CSV formats

### Parameter Management
- Global parameter controls:
  - Diffusion coefficient
  - Evapotranspiration rate
  - Irrigation rate
  - Moisture threshold
- Per-cell parameter customization
- Parameter reset controls (individual and global)

### Visualization Options
- Multiple color schemes (default, blue scale, grayscale)
- Cell value display (enabled by default)
- Time series graphs
- Heatmap visualization
- Dynamic color legend

### Cell Controls
- Individual moisture level adjustment
- Tap status control
- Parameter override capabilities
- Reset options for individual cells

## Documentation

- [User Guide](claudeDev_docs/UserGuide.md) - Detailed instructions for using the simulation
- [API Documentation](claudeDev_docs/APIDocumentation.md) - Backend API reference
- [Technical Details](claudeDev_docs/sprintDocs/Sprint2_CoreFunctionalityRefactoring.md) - Implementation details and architecture

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to `http://localhost:3000`

## Usage

The simulation provides an intuitive interface for:
1. Setting up initial conditions
2. Adjusting global and per-cell parameters
3. Running continuous or step-by-step simulations
4. Visualizing moisture changes in real-time
5. Exporting simulation data for analysis

For detailed usage instructions, please refer to the [User Guide](claudeDev_docs/UserGuide.md).

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For more details, see our [Developer Setup Guide](claudeDev_docs/userInstructions/DeveloperSetup.md).

## License

[Specify the project's license]
