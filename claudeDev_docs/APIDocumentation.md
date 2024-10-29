# API Documentation

This document outlines the API endpoints for the Soil Moisture Simulation project.

## Base URL

All URLs referenced in the documentation have the following base:

```
http://localhost:3000/api
```

## Endpoints

### Save Simulation

Save the current state of a simulation.

- **URL:** `/simulations`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "name": "string",
    "setupParams": {
      "gridSize": {
        "rows": "number",
        "cols": "number"
      },
      "initialMoistureDistribution": "string",
      "initialMoistureValue": "number"
    },
    "simulationParams": {
      "diffusionCoefficient": "number",
      "evapotranspirationRate": "number",
      "irrigationRate": "number",
      "moistureThreshold": "number"
    },
    "displaySettings": {
      "colorScheme": "string",
      "displayValuesInCells": "boolean"
    },
    "gridHistory": "array",
    "timeStep": "number",
    "timeStepSize": "number",
    "moistureHistory": "array"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "id": "string" }`

### Load Simulation

Retrieve a saved simulation by ID.

- **URL:** `/simulations/:id`
- **Method:** `GET`
- **URL Params:** 
  - Required: `id=[string]`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ [Simulation Data] }`

### Export Simulation

Export simulation data in JSON or CSV format.

- **URL:** `/simulations/:id/export`
- **Method:** `GET`
- **URL Params:**
  - Required: `id=[string]`
  - Required: `format=[string]` (either 'json' or 'csv')
- **Success Response:**
  - **Code:** 200
  - **Content:** File download (JSON or CSV)

## Error Responses

- **Code:** 404 NOT FOUND
  - **Content:** `{ "error": "Simulation not found" }`

- **Code:** 400 BAD REQUEST
  - **Content:** `{ "error": "Invalid input" }`

- **Code:** 500 INTERNAL SERVER ERROR
  - **Content:** `{ "error": "Internal server error" }`
