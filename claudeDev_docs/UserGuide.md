# Soil Moisture Simulation User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Simulation Controls](#simulation-controls)
4. [Parameter Management](#parameter-management)
5. [Cell Interactions](#cell-interactions)
6. [Visualization Options](#visualization-options)
7. [Saving and Loading](#saving-and-loading)
8. [Exporting Data](#exporting-data)
9. [Troubleshooting](#troubleshooting)

## Introduction

The Soil Moisture Simulation is an interactive tool for modeling and visualizing soil moisture dynamics. This guide will help you navigate the features and controls of the simulation.

## Getting Started

1. Open the application in your web browser
2. You will see a grid representing the soil, with controls and parameter settings on the right side
3. Cell values are displayed by default for easy monitoring

## Simulation Controls

- **Start/Pause**: Begin or pause the simulation
- **Reset**: Return the simulation to its initial state
- **Step Forward**: Advance the simulation by one time step
- **Step Backward**: Revert the simulation to the previous time step
- **Reset All Cells**: Return all cells to global parameter settings

## Parameter Management

### Global Parameters
- **Diffusion Coefficient**: Controls how quickly moisture spreads between cells
- **Evapotranspiration Rate**: Rate at which moisture is lost to the atmosphere
- **Irrigation Rate**: Rate at which water is added when irrigation is active
- **Moisture Threshold**: The moisture level at which irrigation is triggered

### Per-Cell Parameters
You can customize parameters for individual cells:
1. Click on a cell to open the cell details dialog
2. Adjust individual parameters for the selected cell
3. Use the reset button to return a cell to global parameter values
4. Use "Reset All Cells to Global Parameters" to reset all cells at once

## Cell Interactions

When clicking on a cell, you can:
- View current moisture levels
- Set moisture manually
- Toggle irrigation tap status
- Customize cell-specific parameters
- Reset cell controls to global settings

## Visualization Options

- **Color Scheme**: Choose between default (red to blue), blue scale, or grayscale
- **Display Values**: Toggle the display of moisture values within each cell (on by default)
- **Time Series**: View moisture changes over time for selected cells
- **Heatmap**: Visualize the entire grid's moisture distribution

## Saving and Loading

To save your simulation:
1. Click the "Save Simulation" button
2. Note the simulation ID provided

To load a saved simulation:
1. Enter the simulation ID
2. Click "Load Simulation"

## Exporting Data

1. Click "Export as JSON" or "Export as CSV"
2. If the simulation hasn't been saved, you'll be prompted to save it first
3. Choose where to save the exported file

## Troubleshooting

Common Issues:
- If parameter changes don't take effect, check if the cell has custom parameters set
- To reset a stuck cell, use the reset controls in the cell details dialog
- If the simulation seems inconsistent, try using the "Reset All Cells" function

For additional help or to report issues, please contact our support team or open an issue on our GitHub repository.
