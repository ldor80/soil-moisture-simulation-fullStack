import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import db from '../db';
import { Parser } from 'json2csv';

const router = express.Router();

// Updated Cell interface to include per-cell parameters
interface Cell {
  row: number;
  col: number;
  moisture: number;
  tapStatus: boolean;
  overrideTap: boolean;
  // Add per-cell parameters (optional)
  diffusionCoefficient?: number;
  evapotranspirationRate?: number;
  irrigationRate?: number;
  moistureThreshold?: number;
}

// Define SimulationParams interface
interface SimulationParams {
  diffusionCoefficient: number;
  evapotranspirationRate: number;
  irrigationRate: number;
  moistureThreshold: number;
  timeStepSize: number;
  units: {
    moisture: 'percentage' | 'volumetric';
    length: 'metric' | 'imperial';
  };
}

// Update UserAction interface to include new actions
interface UserAction {
  action:
    | 'ToggleTap'
    | 'ResetTapControl'
    | 'SetMoisture'
    | 'SetCellParameter'
    | 'ResetCellParameter'
    | 'ResetAllCellParameters';
  cellIndex?: number;
  param?: keyof SimulationParams;
  value?: number | string;
}

// Update GridHistoryEntry interface
interface GridHistoryEntry {
  timeStep: number;
  grid: Cell[][];
  parameterChanges?: {
    [key: string]: number | string;
  };
  userActions?: UserAction[];
}

// Update SimulationData interface
interface SimulationData {
  name: string;
  setupParams: {
    gridSize: { rows: number; cols: number };
    initialMoistureDistribution: 'Uniform' | 'Random';
    initialMoistureValue?: number;
  };
  simulationParams: SimulationParams;
  displaySettings: {
    colorScheme: 'default' | 'blue' | 'grayscale';
    displayValuesInCells: boolean;
  };
  gridHistory: GridHistoryEntry[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Cell:
 *       type: object
 *       properties:
 *         row:
 *           type: number
 *         col:
 *           type: number
 *         moisture:
 *           type: number
 *         tapStatus:
 *           type: boolean
 *         overrideTap:
 *           type: boolean
 *         diffusionCoefficient:
 *           type: number
 *         evapotranspirationRate:
 *           type: number
 *         irrigationRate:
 *           type: number
 *         moistureThreshold:
 *           type: number
 *     SimulationParams:
 *       type: object
 *       properties:
 *         diffusionCoefficient:
 *           type: number
 *         evapotranspirationRate:
 *           type: number
 *         irrigationRate:
 *           type: number
 *         moistureThreshold:
 *           type: number
 *         timeStepSize:
 *           type: number
 *         units:
 *           type: object
 *           properties:
 *             moisture:
 *               type: string
 *               enum: [percentage, volumetric]
 *             length:
 *               type: string
 *               enum: [metric, imperial]
 *     GridHistoryEntry:
 *       type: object
 *       properties:
 *         timeStep:
 *           type: number
 *         grid:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Cell'
 *         parameterChanges:
 *           type: object
 *           additionalProperties:
 *             type: number
 *         userActions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum:
 *                   - ToggleTap
 *                   - ResetTapControl
 *                   - SetMoisture
 *                   - SetCellParameter
 *                   - ResetCellParameter
 *                   - ResetAllCellParameters
 *               cellIndex:
 *                 type: number
 *               param:
 *                 type: string
 *               value:
 *                 type: number
 *     SimulationData:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the simulation
 *         setupParams:
 *           type: object
 *           properties:
 *             gridSize:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: number
 *                 cols:
 *                   type: number
 *             initialMoistureDistribution:
 *               type: string
 *               enum: [Uniform, Random]
 *             initialMoistureValue:
 *               type: number
 *         simulationParams:
 *           $ref: '#/components/schemas/SimulationParams'
 *         displaySettings:
 *           type: object
 *           properties:
 *             colorScheme:
 *               type: string
 *               enum: [default, blue, grayscale]
 *             displayValuesInCells:
 *               type: boolean
 *         gridHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GridHistoryEntry'
 */

/**
 * @swagger
 * /api/simulations:
 *   post:
 *     summary: Save a new simulation
 *     tags: [Simulations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SimulationData'
 *     responses:
 *       201:
 *         description: Simulation saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the saved simulation
 *       500:
 *         description: Server error
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const simulationData: SimulationData = req.body;
    const userId = 1; // Temporarily use a fixed user ID for testing

    // Insert the simulation data into the database
    const result = await db.query(
      'INSERT INTO simulations (user_id, name, data) VALUES ($1, $2, $3) RETURNING id',
      [userId, simulationData.name, simulationData]
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error saving simulation:', error);
    res.status(500).json({ error: 'Failed to save simulation' });
  }
});

/**
 * @swagger
 * /api/simulations/{id}:
 *   get:
 *     summary: Retrieve a specific simulation
 *     tags: [Simulations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The simulation ID
 *     responses:
 *       200:
 *         description: The simulation data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimulationData'
 *       404:
 *         description: Simulation not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const simulationId = req.params.id;
    const userId = 1; // Temporarily use a fixed user ID for testing

    // Retrieve the simulation data from the database
    const result = await db.query(
      'SELECT name, data FROM simulations WHERE id = $1 AND user_id = $2',
      [simulationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const { name, data } = result.rows[0];
    // Ensure 'data' is parsed correctly
    const simulationData: SimulationData = {
      name,
      ...((typeof data === 'string') ? JSON.parse(data) : data),
    };

    res.json(simulationData);
  } catch (error) {
    console.error('Error retrieving simulation:', error);
    res.status(500).json({ error: 'Failed to retrieve simulation' });
  }
});

/**
 * @swagger
 * /api/simulations/{id}/export:
 *   get:
 *     summary: Export simulation data
 *     tags: [Simulations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The simulation ID
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         description: The export format
 *     responses:
 *       200:
 *         description: Exported simulation data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimulationData'
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid export format
 *       404:
 *         description: Simulation not found
 *       500:
 *         description: Server error
 */
router.get('/:id/export', async (req: Request, res: Response) => {
  try {
    const simulationId = req.params.id;
    const format = req.query.format as string;
    const userId = 1; // Temporarily use a fixed user ID for testing

    // Retrieve the simulation data from the database
    const result = await db.query(
      'SELECT name, data FROM simulations WHERE id = $1 AND user_id = $2',
      [simulationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const { name, data } = result.rows[0];
    // Ensure 'data' is parsed correctly
    const simulationData: SimulationData = {
      name,
      ...((typeof data === 'string') ? JSON.parse(data) : data),
    };

    if (format === 'json') {
      // Ensure that cell data includes all properties, including per-cell parameters
      res.header('Content-Type', 'application/json');
      res.attachment(`simulation_${simulationId}_export.json`);
      res.send(JSON.stringify(simulationData, null, 2));
    } else if (format === 'csv') {
      // Flatten the gridHistory data for CSV export
      const flattenedData = simulationData.gridHistory.flatMap((historyItem) =>
        historyItem.grid.flat().map((cell) => {
          const cellIndex = cell.row * simulationData.setupParams.gridSize.cols + cell.col;

          // Filter user actions for this cell
          const userActionsForCell = (historyItem.userActions || []).filter(
            (action) => action.cellIndex === cellIndex
          );

          // Include per-cell parameters, defaulting to global parameters if undefined
          const cell_diffusionCoefficient =
            cell.diffusionCoefficient ?? simulationData.simulationParams.diffusionCoefficient;
          const cell_evapotranspirationRate =
            cell.evapotranspirationRate ?? simulationData.simulationParams.evapotranspirationRate;
          const cell_irrigationRate =
            cell.irrigationRate ?? simulationData.simulationParams.irrigationRate;
          const cell_moistureThreshold =
            cell.moistureThreshold ?? simulationData.simulationParams.moistureThreshold;

          return {
            timeStep: historyItem.timeStep,
            row: cell.row,
            col: cell.col,
            moisture_percentage: Number((cell.moisture * 100).toFixed(2)),
            moisture_volumetric: Number((cell.moisture * 0.5).toFixed(4)),
            cell_diffusionCoefficient,
            cell_evapotranspirationRate,
            cell_irrigationRate,
            cell_moistureThreshold,
            tapStatus: cell.tapStatus,
            overrideTap: cell.overrideTap,
            // Include parameter changes only if they are global parameter changes
            parameterChanges:
              historyItem.parameterChanges && Object.keys(historyItem.parameterChanges).length > 0
                ? JSON.stringify(historyItem.parameterChanges)
                : '',
            // Include user actions only if they pertain to this cell
            userActions: userActionsForCell.length > 0 ? JSON.stringify(userActionsForCell) : '',
          };
        })
      );

      // Define the fields to include in the CSV, in the desired order
      const fields = [
        'timeStep',
        'row',
        'col',
        'moisture_percentage',
        'moisture_volumetric',
        'cell_diffusionCoefficient',
        'cell_evapotranspirationRate',
        'cell_irrigationRate',
        'cell_moistureThreshold',
        'tapStatus',
        'overrideTap',
        'parameterChanges',
        'userActions',
      ];

      // Create the CSV parser with the specified fields
      const parser = new Parser({ fields });
      const csv = parser.parse(flattenedData);

      // Send the CSV file as a response
      res.header('Content-Type', 'text/csv');
      res.attachment(`simulation_${simulationId}_export.csv`);
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Invalid export format' });
    }
  } catch (error) {
    console.error('Error exporting simulation:', error);
    res.status(500).json({ error: 'Failed to export simulation' });
  }
});

export default router;
