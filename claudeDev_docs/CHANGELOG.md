# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Per-cell parameter customization (diffusionCoefficient, evapotranspirationRate, irrigationRate, moistureThreshold)
- Functions for managing cell-specific parameters (updateCellParameter, resetCellParameter, resetAllCellParameters)
- Enhanced visualization with default cell value display
- Improved cell details dialog with parameter controls
- Automatic save prompt before export operations
- Simulation load and save state tracking using useRef
- "Reset All Cells to Global Parameters" button with info tooltip

### Changed
- Enhanced grid initialization to store initial state for accurate resets
- Improved state management using functional updates
- Updated stepBackward functionality for more consistent operation
- Enhanced gridHistory to include parameter changes and user actions
- Modified reset functionality to use stored initial grid
- Improved synchronization between grid and history states

### Fixed
- State consistency issues in multiple quick updates
- Grid history management for parameter changes
- Export functionality to ensure data consistency
- Reset operation accuracy

## [0.2.0] - 2023-05-XX

### Added
- Save simulation functionality
- Export simulation data in JSON and CSV formats
- Improved error handling and user feedback

### Fixed
- 'Step Backward' functionality now correctly reverts to previous simulation steps
- Initial grid values and correct time steps are now included in exported data

### Changed
- Replaced 'timestamp' with 'timeStep' for consistent representation of simulation progression
- Ensured consistency between frontend and backend data structures

## [0.1.0] - 2023-04-XX

### Added
- Initial release of the Soil Moisture Simulation
- Interactive grid-based soil moisture simulation
- Adjustable parameters: diffusion coefficient, evapotranspiration rate, irrigation rate, and moisture threshold
- Real-time visualization of moisture levels
- Basic simulation controls (start, pause, reset, step forward)

[Unreleased]: https://github.com/yourusername/soil-moisture-simulation/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/yourusername/soil-moisture-simulation/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/soil-moisture-simulation/releases/tag/v0.1.0
