'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Info, X } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import dynamic from 'next/dynamic';
import { useSettings } from '@/contexts/SettingsContext';

// Dynamically import the BlockMath component for rendering mathematical formulas
const BlockMath = dynamic(() => import('react-katex').then((mod) => mod.BlockMath), { ssr: false });

// Function to log messages to the backend (replace with actual backend logging if needed)
async function logToBackend(message: string) {
  console.log(message);
}

// Define the structure of a single cell in the simulation grid
interface Cell {
  row: number;
  col: number;
  moisture: number;
  moistureVolumetric: number;
  tapStatus: boolean;
  overrideTap: boolean;
  // Add per-cell parameters (optional)
  diffusionCoefficient?: number;
  evapotranspirationRate?: number;
  irrigationRate?: number;
  moistureThreshold?: number;
}

// Define the structure of simulation parameters
interface SimulationParams {
  diffusionCoefficient: number;
  evapotranspirationRate: number;
  irrigationRate: number;
  moistureThreshold: number;
}

// Define the structure for user actions
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

// Define the structure for a grid history entry
interface GridHistoryEntry {
  grid: Cell[][];
  params: SimulationParams;
  timeStep: number;
  parameterChanges?: {
    [key: string]: number | string;
  };
  userActions?: UserAction[];
}

// Define the structure of the saved simulation data
interface SavedSimulationData {
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
  timeStep: number;
  timeStepSize: number;
  moistureHistory: { time: number; moisture: number; moistureVolumetric: number }[];
}

// Utility function to get color based on moisture level and color scheme
const getColorForMoisture = (moisture: number, colorScheme: string): string => {
  switch (colorScheme) {
    case 'blue':
      const lightness = 100 - moisture * 50; // 100% to 50%
      return `hsl(240, 100%, ${lightness}%)`;
    case 'grayscale':
      const gray = 100 - moisture * 100;
      return `hsl(0, 0%, ${gray}%)`;
    default:
      const hue = moisture * 240; // 0 (red) to 240 (blue)
      return `hsl(${hue}, 100%, 50%)`;
  }
};

// Utility function to get text color based on moisture level
const getTextColorForMoisture = (moisture: number): string => {
  return moisture > 0.5 ? 'white' : 'black';
};

// Explanations for each simulation parameter
const parameterExplanations: { [key in keyof SimulationParams]: string } = {
  diffusionCoefficient: "Diffusion Coefficient (D): Controls the rate at which moisture moves between cells. Higher values mean faster diffusion.",
  evapotranspirationRate: "Evapotranspiration Rate (ET₀): Represents the rate at which water is lost from the soil due to evaporation and plant transpiration.",
  irrigationRate: "Irrigation Rate: The amount of water added to the soil when irrigation is applied.",
  moistureThreshold: "Moisture Threshold (θₜ): The soil moisture level below which irrigation is triggered.",
};

// Mathematical formulas for each simulation parameter
const parameterFormulas: { [key in keyof SimulationParams]: string } = {
  diffusionCoefficient: `\\Delta\\theta_{\\text{movement}} = D \\times \\sum_{\\text{neighbors}} (\\theta_{\\text{neighbor}} - \\theta_{i,j})`,
  evapotranspirationRate: `\\Delta\\theta = -ET_0 \\times \\Delta t`,
  irrigationRate: `\\Delta\\theta = I_r \\times \\Delta t`,
  moistureThreshold: '', // No formula for this parameter
};

// Color Legend Component
const ColorLegend: React.FC<{ colorScheme: string; moistureUnit: 'percentage' | 'volumetric' }> = ({ colorScheme, moistureUnit }) => {
  const minLabel = moistureUnit === 'percentage' ? '0% (Dry)' : '0.000 m³/m³ (Dry)';
  const midLabel = moistureUnit === 'percentage' ? '50%' : '0.250 m³/m³';
  const maxLabel = moistureUnit === 'percentage' ? '100% (Wet)' : '0.500 m³/m³';

  return (
    <div className="flex items-center justify-between mt-4 bg-white p-2 rounded-md shadow">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4" style={{ backgroundColor: getColorForMoisture(0, colorScheme) }}></div>
        <span>{minLabel}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4" style={{ backgroundColor: getColorForMoisture(0.5, colorScheme) }}></div>
        <span>{midLabel}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4" style={{ backgroundColor: getColorForMoisture(1, colorScheme) }}></div>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};

function SimulationContent() {
  // Get search parameters from the URL
  const searchParams = useSearchParams() ?? new URLSearchParams();
  // Get global settings using the useSettings hook
  const { units, setUnits, moistureUnit, setMoistureUnit, colorScheme, setColorScheme, displayValuesInCells, setDisplayValuesInCells } = useSettings();

  // Set 'Display Values in Cells' toggle to 'on' by default
  useEffect(() => {
    setDisplayValuesInCells(true);
  }, [setDisplayValuesInCells]);

  // State for the current grid
  const [grid, setGrid] = useState<Cell[][]>([]);
  // State for the initial grid configuration to handle resets correctly
  const [initialGrid, setInitialGrid] = useState<Cell[][]>([]);
  // State for the history of grid states
  const [gridHistory, setGridHistory] = useState<GridHistoryEntry[]>([]);
  // State to track if the simulation is running
  const [isRunning, setIsRunning] = useState(false);
  // Current time step of the simulation
  const [timeStep, setTimeStep] = useState(0);
  // Simulation parameters
  const [params, setParams] = useState<SimulationParams>({
    diffusionCoefficient: 0.1,
    evapotranspirationRate: 0.02,
    irrigationRate: 0.05,
    moistureThreshold: 0.2,
  });
  // State for the currently selected cell
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  // History of moisture values for the selected cell
  const [moistureHistory, setMoistureHistory] = useState<{ time: number; moisture: number; moistureVolumetric: number }[]>([]);
  // State to control the visibility of cell details
  const [showCellDetails, setShowCellDetails] = useState(false);
  // Size of each time step in hours
  const [timeStepSize, setTimeStepSize] = useState<number>(1); // Default to 1 hour
  // State to control which parameter info panel is open
  const [openInfoPanel, setOpenInfoPanel] = useState<keyof SimulationParams | null>(null);
  // State to control the visibility of the 'Reset All Cells' info
  const [showResetAllCellsInfo, setShowResetAllCellsInfo] = useState<boolean>(false);
  // ID of the current simulation (if loaded from saved state)
  const [simulationId, setSimulationId] = useState<string | null>(searchParams.get('id'));
  // Ref to prevent re-initialization after loading simulation
  const isSimulationLoaded = useRef(false);
  // Ref to track if the simulation has been saved
  const isSimulationSaved = useRef(false);

  // Function to fetch saved simulation data
  const fetchSimulationData = useCallback(async (id: string): Promise<SavedSimulationData | null> => {
    try {
      const response = await fetch(`http://localhost:3000/api/simulations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch simulation data');
      }
      const data: SavedSimulationData = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching simulation data:', error);
      return null;
    }
  }, []);

  // Function to add a new entry to grid history
  const addGridHistoryEntry = useCallback(
    (newGrid: Cell[][], changes: { [key: string]: number | string }, actions: UserAction[]) => {
      // Mark the simulation as unsaved due to changes
      isSimulationSaved.current = false;

      // Determine if there are any changes or actions to record
      if (Object.keys(changes).length === 0 && actions.length === 0) {
        return; // No changes to record
      }

      if (timeStep === 0) {
        // Update the initial grid history entry
        setGridHistory((prevHistory) => {
          const updatedHistory = [...prevHistory];
          const existingActions = updatedHistory[0].userActions || [];

          // Consolidate actions to prevent duplication
          const consolidatedActions = [...existingActions];
          actions.forEach((newAction) => {
            const index = consolidatedActions.findIndex(
              (action) =>
                action.action === newAction.action &&
                action.cellIndex === newAction.cellIndex &&
                action.param === newAction.param
            );
            if (index !== -1) {
              // Update existing action with new value
              consolidatedActions[index] = { ...consolidatedActions[index], ...newAction };
            } else {
              // Add new action
              consolidatedActions.push(newAction);
            }
          });

          updatedHistory[0] = {
            ...updatedHistory[0],
            grid: JSON.parse(JSON.stringify(newGrid)),
            parameterChanges: {
              ...updatedHistory[0].parameterChanges,
              ...changes,
            },
            userActions: consolidatedActions,
          };
          return updatedHistory;
        });
      } else {
        // For timeStep > 0, add a new history entry if there are changes
        setGridHistory((prevHistory) => {
          const newTimeStep = timeStep + 1;
          const newHistoryEntry: GridHistoryEntry = {
            timeStep: newTimeStep,
            grid: JSON.parse(JSON.stringify(newGrid)),
            params: { ...params },
            parameterChanges: { ...changes },
            userActions: [...actions],
          };
          return [...prevHistory, newHistoryEntry];
        });
        setTimeStep((prevTimeStep) => prevTimeStep + 1);
      }
    },
    [timeStep, params]
  );

  // Function to initialize the grid
  const initializeGrid = useCallback(
    (savedData?: SavedSimulationData, initialParams?: SimulationParams): Cell[][] => {
      const currentParams = initialParams ?? {
        diffusionCoefficient: 0.1,
        evapotranspirationRate: 0.02,
        irrigationRate: 0.05,
        moistureThreshold: 0.2,
      };

      if (savedData) {
        // If we have saved data, use it to initialize the grid
        return savedData.gridHistory[savedData.gridHistory.length - 1].grid;
      } else {
        // If we don't have saved data, create a new grid based on URL parameters
        const rows = parseInt(searchParams.get('rows') ?? '10', 10);
        const cols = parseInt(searchParams.get('cols') ?? '10', 10);
        const initialMoisture = searchParams.get('initialMoisture') ?? 'uniform';
        const uniformMoisture = parseFloat(searchParams.get('uniformMoisture') ?? '50') / 100;

        console.log('Initializing new simulation:', { rows, cols, initialMoisture, uniformMoisture });

        // Create the initial grid
        const generatedInitialGrid: Cell[][] = Array.from({ length: rows }, (_, rowIndex) =>
          Array.from({ length: cols }, (_, colIndex) => {
            const moisture = initialMoisture === 'uniform' ? uniformMoisture : Math.random();
            return {
              row: rowIndex,
              col: colIndex,
              moisture: moisture,
              moistureVolumetric: moisture * 0.5,
              tapStatus: moisture < currentParams.moistureThreshold, // Use currentParams
              overrideTap: false,
            };
          })
        );

        // Store the initial grid for resets
        setInitialGrid(JSON.parse(JSON.stringify(generatedInitialGrid)));

        // Add the initial grid state to gridHistory
        setGridHistory([
          {
            timeStep: 0,
            grid: JSON.parse(JSON.stringify(generatedInitialGrid)),
            params: { ...currentParams },
            parameterChanges: {},
            userActions: [],
          },
        ]);

        return generatedInitialGrid;
      }
    },
    [searchParams]
  );

  // Effect to load simulation data
  useEffect(() => {
    const loadSimulation = async () => {
      if (!isSimulationLoaded.current) {
        let initialGridData: Cell[][];

        if (simulationId) {
          const savedData = await fetchSimulationData(simulationId);
          if (savedData) {
            initialGridData = initializeGrid(savedData, savedData.simulationParams);
            setGrid(initialGridData);
            setInitialGrid(JSON.parse(JSON.stringify(initialGridData))); // Store initial grid for resets
            setGridHistory(savedData.gridHistory);
            setTimeStep(savedData.timeStep || 0);
            setTimeStepSize(savedData.timeStepSize || 1);
            setMoistureHistory(savedData.moistureHistory || []);
            setParams(savedData.simulationParams);
            isSimulationLoaded.current = true;
            isSimulationSaved.current = true;
            logToBackend('Loaded saved simulation');
          } else {
            // Handle error
            console.error('Failed to load simulation data.');
            alert('Failed to load simulation data. Please check the simulation ID and try again.');
          }
        } else {
          initialGridData = initializeGrid();
          setGrid(initialGridData);
          logToBackend('Initialized new simulation');
          isSimulationLoaded.current = true;
        }
      }
    };

    loadSimulation();
  }, [simulationId, fetchSimulationData, initializeGrid]);

  // Function to handle global parameter changes
  const handleParamChange = useCallback(
    (param: keyof SimulationParams, value: number) => {
      setParams((prevParams) => {
        const newParams = { ...prevParams, [param]: value };

        // Prepare changes object
        const changes = { [param]: value };

        // No specific user actions for global changes
        const actions: UserAction[] = [];

        // Update grid history with changes
        addGridHistoryEntry(grid, changes, actions);

        return newParams;
      });
    },
    [grid, addGridHistoryEntry]
  );

  // Function to update the grid state based on simulation logic
  const updateGrid = useCallback(() => {
    // Avoid nested setState calls
    const prevGrid = grid;
    const newGrid = prevGrid.map((row) =>
      row.map((cell) => {
        const newCell = { ...cell };

        // Use per-cell parameters if available, otherwise use global parameters
        const cellParams = {
          diffusionCoefficient: cell.diffusionCoefficient ?? params.diffusionCoefficient,
          evapotranspirationRate: cell.evapotranspirationRate ?? params.evapotranspirationRate,
          irrigationRate: cell.irrigationRate ?? params.irrigationRate,
          moistureThreshold: cell.moistureThreshold ?? params.moistureThreshold,
        };

        // Determine tap status unless overridden
        if (!newCell.overrideTap) {
          newCell.tapStatus = newCell.moisture < cellParams.moistureThreshold;
        }

        let moistureChange = 0;

        // Apply irrigation or evapotranspiration based on tap status
        if (newCell.tapStatus) {
          moistureChange += cellParams.irrigationRate * timeStepSize;
        } else {
          moistureChange -= cellParams.evapotranspirationRate * timeStepSize;
        }

        // Get neighboring cells for diffusion
        const neighbors = [
          prevGrid[newCell.row - 1]?.[newCell.col],
          prevGrid[newCell.row + 1]?.[newCell.col],
          prevGrid[newCell.row]?.[newCell.col - 1],
          prevGrid[newCell.row]?.[newCell.col + 1],
        ].filter(Boolean) as Cell[];

        // Calculate moisture change due to diffusion
        neighbors.forEach((neighbor) => {
          const neighborDiffusionCoefficient = neighbor.diffusionCoefficient ?? params.diffusionCoefficient;
          const averageDiffusionCoefficient = (cellParams.diffusionCoefficient + neighborDiffusionCoefficient) / 2;
          moistureChange += averageDiffusionCoefficient * (neighbor.moisture - newCell.moisture) * timeStepSize;
        });

        // Update moisture and ensure it's within bounds
        newCell.moisture = Math.max(0, Math.min(1, newCell.moisture + moistureChange));
        newCell.moistureVolumetric = newCell.moisture * 0.5;

        return newCell;
      })
    );

    // Update grid and history
    const newTimeStep = timeStep + 1;

    const newGridHistoryEntry: GridHistoryEntry = {
      timeStep: newTimeStep,
      grid: JSON.parse(JSON.stringify(newGrid)),
      params: { ...params },
      parameterChanges: {},
      userActions: [],
    };

    setGrid(newGrid);
    setTimeStep(newTimeStep);
    setGridHistory((prevHistory) => [...prevHistory, newGridHistoryEntry]);

    isSimulationSaved.current = false; // Mark as unsaved when the grid updates
  }, [grid, params, timeStep, timeStepSize]);

  // Function to step backward in the simulation
  const stepBackward = useCallback(() => {
    if (timeStep > 0) {
      const newHistory = gridHistory.slice(0, -1);
      const previousEntry = newHistory[newHistory.length - 1];

      if (previousEntry) {
        setGrid(JSON.parse(JSON.stringify(previousEntry.grid)));
        setParams(previousEntry.params);
        setTimeStep(previousEntry.timeStep);
      } else {
        setTimeStep(0);
      }

      setGridHistory(newHistory);

      // Update moisture history if necessary
      setMoistureHistory((prev) => prev.slice(0, -1));

      isSimulationSaved.current = false; // Mark as unsaved when stepping back
    } else {
      alert('Cannot step backward: Already at initial state.');
    }
  }, [timeStep, gridHistory]);

  // Effect to update moisture history for selected cell
  useEffect(() => {
    if (selectedCell && grid.length > 0) {
      const { row, col } = selectedCell;
      setMoistureHistory((prev) => [
        ...prev,
        {
          time: timeStep,
          moisture: grid[row][col].moisture,
          moistureVolumetric: grid[row][col].moistureVolumetric,
        },
      ]);
    }
  }, [selectedCell, timeStep, grid]);

  // Effect to run simulation
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        updateGrid();
      }, 1000); // Adjust the interval as needed
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, updateGrid]);

  // Function to toggle simulation running state
  const toggleSimulation = useCallback(() => {
    const newState = !isRunning;
    logToBackend(`Simulation ${newState ? 'started' : 'paused'}`);
    setIsRunning(newState);
  }, [isRunning]);

  // Function to reset the simulation
  const resetSimulation = useCallback(() => {
    logToBackend('Reset Simulation clicked');
    setIsRunning(false);
    setTimeStep(0);
    setMoistureHistory([]);

    if (initialGrid.length > 0) {
      // Restore the grid to the initial state
      const resetGrid = JSON.parse(JSON.stringify(initialGrid));
      setGrid(resetGrid);
      setGridHistory([
        {
          timeStep: 0,
          grid: resetGrid,
          params: { ...params },
          parameterChanges: {},
          userActions: [],
        },
      ]);
    } else {
      // If initialGrid is not set, re-initialize
      const newInitialGrid = initializeGrid(undefined, params);
      setGrid(newInitialGrid);
      // gridHistory is already set in initializeGrid
    }

    isSimulationSaved.current = false; // Mark as unsaved after reset
  }, [initialGrid, params, initializeGrid]);

  // Function to handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
    setShowCellDetails(true);
  }, []);

  // Function to format moisture values
  const formatMoisture = useCallback(
    (moisture: number) => {
      if (moistureUnit === 'percentage') {
        return `${(moisture * 100).toFixed(1)}%`;
      } else {
        const volumetricMoisture = moisture * 0.5;
        return `${volumetricMoisture.toFixed(3)} m³/m³`;
      }
    },
    [moistureUnit]
  );

  // Function to get units for parameters
  const getUnitForParameter = useCallback(
    (paramName: keyof SimulationParams) => {
      switch (paramName) {
        case 'diffusionCoefficient':
          return ''; // Unitless
        case 'evapotranspirationRate':
          return units === 'metric' ? 'mm/h' : 'in/h';
        case 'irrigationRate':
          return units === 'metric' ? 'mm/h' : 'in/h';
        case 'moistureThreshold':
          return moistureUnit === 'percentage' ? '%' : 'm³/m³';
        default:
          return '';
      }
    },
    [units, moistureUnit]
  );

  // Function to format parameter names
  const formatParameterName = useCallback((name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  }, []);

  // Parameter control component
  const ParamControl = useCallback(
    ({
      name,
      value,
      onChange,
      min,
      max,
      step,
    }: {
      name: keyof SimulationParams;
      value: number;
      onChange: (value: number) => void;
      min: number;
      max: number;
      step: number;
    }) => {
      const unit = getUnitForParameter(name);
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={name} className="flex items-center space-x-1">
              <span>{`${formatParameterName(name)}${unit ? ` (${unit})` : ''}`}</span>
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenInfoPanel(openInfoPanel === name ? null : name)}
            >
              {openInfoPanel === name ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            </Button>
          </div>
          {openInfoPanel === name && (
            <Card>
              <CardContent className="p-4">
                <p>{parameterExplanations[name]}</p>
                {parameterFormulas[name] && parameterFormulas[name].trim() !== '' && (
                  <BlockMath math={parameterFormulas[name]} />
                )}
              </CardContent>
            </Card>
          )}
          <div className="flex items-center space-x-2">
            <Input
              id={name}
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = parseFloat(e.target.value);
                if (!isNaN(newValue) && newValue >= min && newValue <= max) {
                  onChange(newValue);
                }
              }}
              className="w-20"
            />
            <Slider
              min={min}
              max={max}
              step={step}
              value={[value]}
              onValueChange={(value) => onChange(value[0])}
              className="flex-1"
            />
          </div>
        </div>
      );
    },
    [getUnitForParameter, formatParameterName, openInfoPanel, parameterExplanations, parameterFormulas]
  );

  // Function to save the current simulation state
  const saveSimulation = useCallback(async (): Promise<string | null> => {
    const simulationData: SavedSimulationData = {
      name: `Simulation_${Date.now()}`,
      setupParams: {
        gridSize: { rows: grid.length, cols: grid[0].length },
        initialMoistureDistribution: 'Uniform',
        initialMoistureValue: gridHistory[0].grid[0][0].moisture,
      },
      simulationParams: params,
      displaySettings: {
        colorScheme,
        displayValuesInCells,
      },
      gridHistory: [...gridHistory],
      timeStep,
      timeStepSize,
      moistureHistory,
    };

    try {
      const response = await fetch('http://localhost:3000/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simulationData),
      });

      if (response.ok) {
        const result = await response.json();
        const newSimulationId = result.id.toString();
        setSimulationId(newSimulationId);
        isSimulationSaved.current = true; // Mark as saved
        alert(`Simulation saved successfully with ID: ${newSimulationId}`);
        return newSimulationId; // Return the new simulation ID
      } else {
        const errorData = await response.json();
        throw new Error(`Failed to save simulation: ${errorData.message || response.statusText}`);
      }
    } catch (error: unknown) {
      console.error('Error saving simulation:', error);
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(
        `Failed to save simulation. Error: ${errorMessage}. Please check the console for more details and ensure the backend server is running.`
      );
      return null;
    }
  }, [grid, params, timeStep, timeStepSize, gridHistory, colorScheme, displayValuesInCells, moistureHistory]);

  // Function to export the simulation data
  const exportSimulation = useCallback(
    async (format: 'json' | 'csv') => {
      let currentSimulationId = simulationId;

      if (!isSimulationSaved.current) {
        currentSimulationId = await saveSimulation();
      }

      if (!currentSimulationId) {
        alert('Failed to save simulation. Cannot export.');
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/simulations/${currentSimulationId}/export?format=${format}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `simulation_${currentSimulationId}_export.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          alert(`Simulation exported successfully as ${format.toUpperCase()}`);
        } else {
          throw new Error(`Failed to export simulation as ${format.toUpperCase()}`);
        }
      } catch (error) {
        console.error(`Error exporting simulation as ${format.toUpperCase()}:`, error);
        alert(`Failed to export simulation as ${format.toUpperCase()}. Please try again.`);
      }
    },
    [simulationId, saveSimulation]
  );

  // Function to toggle the tap status of a cell
  const toggleTap = useCallback(
    (row: number, col: number) => {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = {
          ...newGrid[row][col],
          tapStatus: !newGrid[row][col].tapStatus,
          overrideTap: true,
        };

        return newGrid;
      });

      const gridLength = grid[0].length;
      const actions: UserAction[] = [
        {
          action: 'ToggleTap',
          cellIndex: row * gridLength + col,
        },
      ];

      addGridHistoryEntry(grid, {}, actions);
    },
    [grid, addGridHistoryEntry]
  );

  // Function to reset tap control of a cell
  const resetTapControl = useCallback(
    (row: number, col: number) => {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = {
          ...newGrid[row][col],
          overrideTap: false,
        };

        return newGrid;
      });

      const gridLength = grid[0].length;
      const actions: UserAction[] = [
        {
          action: 'ResetTapControl',
          cellIndex: row * gridLength + col,
        },
      ];

      addGridHistoryEntry(grid, {}, actions);
    },
    [grid, addGridHistoryEntry]
  );

  // Function to manually set the moisture of a cell
  const setMoisture = useCallback(
    (row: number, col: number, value: number) => {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = {
          ...newGrid[row][col],
          moisture: value,
          moistureVolumetric: value * 0.5,
        };

        return newGrid;
      });

      const gridLength = grid[0].length;
      const actions: UserAction[] = [
        {
          action: 'SetMoisture',
          cellIndex: row * gridLength + col,
          value,
        },
      ];

      addGridHistoryEntry(grid, {}, actions);
    },
    [grid, addGridHistoryEntry]
  );

  // Function to update a cell's parameter
  const updateCellParameter = useCallback(
    (row: number, col: number, param: keyof SimulationParams, value: number) => {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = {
          ...newGrid[row][col],
          [param]: value,
        };

        return newGrid;
      });

      const gridLength = grid[0].length;
      const actions: UserAction[] = [
        {
          action: 'SetCellParameter',
          cellIndex: row * gridLength + col,
          param,
          value,
        },
      ];

      addGridHistoryEntry(grid, {}, actions);
    },
    [grid, addGridHistoryEntry]
  );

  // Function to reset a cell's parameter to the global value
  const resetCellParameter = useCallback(
    (row: number, col: number, param: keyof SimulationParams) => {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[row] = [...newGrid[row]];
        const { [param]: _, ...rest } = newGrid[row][col];
        newGrid[row][col] = rest;

        return newGrid;
      });

      const gridLength = grid[0].length;
      const actions: UserAction[] = [
        {
          action: 'ResetCellParameter',
          cellIndex: row * gridLength + col,
          param,
        },
      ];

      addGridHistoryEntry(grid, {}, actions);
    },
    [grid, addGridHistoryEntry]
  );

  // Function to reset all cell parameters to global values
  const resetAllCellParameters = useCallback(() => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((cell) => {
          const { diffusionCoefficient, evapotranspirationRate, irrigationRate, moistureThreshold, ...rest } = cell;
          return rest;
        })
      );
      return newGrid;
    });

    const actions: UserAction[] = [
      {
        action: 'ResetAllCellParameters',
      },
    ];

    addGridHistoryEntry(grid, {}, actions);
  }, [grid, addGridHistoryEntry]);

  // Render the simulation components
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* Simulation Grid */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Simulation Grid</h2>
        {grid.length > 0 ? (
          <div
            className="grid gap-1 overflow-auto max-h-[60vh]"
            style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
          >
            {grid.flat().map((cell, index) => (
              <div
                key={index}
                className="aspect-square rounded cursor-pointer relative"
                style={{
                  backgroundColor: getColorForMoisture(cell.moisture, colorScheme),
                  border: cell.tapStatus ? '2px solid yellow' : '1px solid gray',
                  boxShadow: cell.overrideTap ? '0 0 0 2px red inset' : 'none',
                }}
                onClick={() => handleCellClick(cell.row, cell.col)}
                aria-label={`Cell ${cell.row},${cell.col}. Moisture: ${formatMoisture(cell.moisture)}. Tap: ${cell.tapStatus ? 'On' : 'Off'}. Override: ${cell.overrideTap ? 'Yes' : 'No'}`}
              >
                {displayValuesInCells && (
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                    style={{ color: getTextColorForMoisture(cell.moisture) }}
                  >
                    {formatMoisture(cell.moisture)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Loading grid...</p>
        )}

        {/* Color Legend */}
        <ColorLegend colorScheme={colorScheme} moistureUnit={moistureUnit} />
      </div>

      {/* Controls */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Controls</h2>
        <div className="space-y-6">
          {/* Simulation Control Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={toggleSimulation} className="w-full">
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={resetSimulation} className="w-full">
              Reset
            </Button>
            <Button onClick={stepBackward} disabled={isRunning || timeStep === 0} className="w-full">
              Step Backward
            </Button>
            <Button onClick={updateGrid} disabled={isRunning} className="w-full">
              Step Forward
            </Button>
          </div>

          {/* Reset All Cells to Global Parameters with Info Icon */}
          <div className="flex items-center justify-between">
            <Button onClick={resetAllCellParameters} className="w-full">
              Reset All Cells to Global Parameters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResetAllCellsInfo(!showResetAllCellsInfo)}
            >
              {showResetAllCellsInfo ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            </Button>
          </div>

          {/* Conditional Note */}
          {showResetAllCellsInfo && (
            <Card>
              <CardContent className="p-4">
                <p>
                  Note: Per-cell parameters override global parameters. Use the "Reset All Cells" button to revert all cells to use global parameters.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Save and Export Buttons */}
          <div className="space-y-2">
            <Button onClick={saveSimulation} className="w-full">
              Save Simulation
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => exportSimulation('json')} className="w-full">
                Export as JSON
              </Button>
              <Button onClick={() => exportSimulation('csv')} className="w-full">
                Export as CSV
              </Button>
            </div>
          </div>

          {/* Parameter Controls */}
          {Object.entries(params).map(([key, value]) => (
            <ParamControl
              key={key}
              name={key as keyof SimulationParams}
              value={value}
              onChange={(newValue) => handleParamChange(key as keyof SimulationParams, newValue)}
              min={key === 'diffusionCoefficient' || key === 'moistureThreshold' ? 0 : 0}
              max={key === 'diffusionCoefficient' || key === 'moistureThreshold' ? 1 : 0.5}
              step={0.01}
            />
          ))}

          {/* Time Step Size Control */}
          <div className="space-y-2">
            <Label htmlFor="timeStepSize">Time Step Size (hours)</Label>
            <Input
              id="timeStepSize"
              type="number"
              min={0.1}
              max={24}
              step={0.1}
              value={timeStepSize}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0.1 && value <= 24) {
                  setTimeStepSize(value);
                }
              }}
            />
          </div>

          {/* Display Values in Cells Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="displayValuesInCells"
              checked={displayValuesInCells}
              onCheckedChange={setDisplayValuesInCells}
            />
            <Label htmlFor="displayValuesInCells">Display Values in Cells</Label>
          </div>

          {/* Color Scheme Selection */}
          <div className="space-y-2">
            <Label htmlFor="colorScheme">Color Scheme</Label>
            <Select value={colorScheme} onValueChange={(value: 'default' | 'blue' | 'grayscale') => setColorScheme(value)}>
              <SelectTrigger id="colorScheme">
                <SelectValue placeholder="Select color scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Red to Blue</SelectItem>
                <SelectItem value="blue">Light to Dark Blue</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Units Selection */}
          <div className="space-y-2">
            <Label htmlFor="units">Units</Label>
            <div className="flex items-center space-x-2">
              <Select value={units} onValueChange={(value: 'metric' | 'imperial') => setUnits(value)}>
                <SelectTrigger id="units">
                  <SelectValue placeholder="Select units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="imperial">Imperial</SelectItem>
                </SelectContent>
              </Select>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Metric: mm/h for rates, cm for depth</p>
                    <p>Imperial: in/h for rates, in for depth</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Moisture Unit Selection */}
          <div className="space-y-2">
            <Label htmlFor="moistureUnit">Moisture Unit</Label>
            <Select
              value={moistureUnit}
              onValueChange={(value: 'percentage' | 'volumetric') => setMoistureUnit(value)}
            >
              <SelectTrigger id="moistureUnit">
                <SelectValue placeholder="Select moisture unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="volumetric">Volumetric (m³/m³)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Visualization */}
      <div className="md:col-span-3">
        <h2 className="text-2xl font-bold mb-4">Data Visualization</h2>
        <Tabs defaultValue="timeSeries">
          <TabsList>
            <TabsTrigger value="timeSeries">Time Series</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          </TabsList>
          <TabsContent value="timeSeries">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moistureHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis
                  label={{
                    value: moistureUnit === 'percentage' ? 'Moisture (%)' : 'Moisture (m³/m³)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                  tickFormatter={(value) => formatMoisture(value)}
                />
                <Tooltip formatter={(value: number) => formatMoisture(value)} />
                <Legend />
                <Line type="monotone" dataKey="moisture" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="heatmap">
            {grid.length > 0 ? (
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
              >
                {grid.flat().map((cell, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded"
                    style={{
                      backgroundColor: getColorForMoisture(cell.moisture, colorScheme),
                    }}
                  />
                ))}
              </div>
            ) : (
              <p>Loading heatmap...</p>
            )}
            {/* Color Legend */}
            <ColorLegend colorScheme={colorScheme} moistureUnit={moistureUnit} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Cell Details Dialog */}
      <Dialog open={showCellDetails} onOpenChange={setShowCellDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cell Details</DialogTitle>
          </DialogHeader>
          {selectedCell && grid[selectedCell.row] && grid[selectedCell.row][selectedCell.col] && (
            <DialogDescription>
              <p>
                <strong>Row:</strong> {selectedCell.row}, <strong>Column:</strong> {selectedCell.col}
              </p>
              <p>
                <strong>Moisture:</strong> {formatMoisture(grid[selectedCell.row][selectedCell.col].moisture)}
              </p>
              <p>
                <strong>Tap Status:</strong> {grid[selectedCell.row][selectedCell.col].tapStatus ? 'On' : 'Off'}
              </p>
              <p>
                <strong>Override:</strong> {grid[selectedCell.row][selectedCell.col].overrideTap ? 'Yes' : 'No'}
              </p>
              <div className="space-y-4 mt-4">
                {/* Set Moisture Manually */}
                <div>
                  <Label htmlFor="manualMoisture">Set Moisture Manually</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="manualMoisture"
                      type="number"
                      min={0}
                      max={moistureUnit === 'percentage' ? 100 : 0.5}
                      step={moistureUnit === 'percentage' ? 1 : 0.01}
                      value={
                        moistureUnit === 'percentage'
                          ? (grid[selectedCell.row][selectedCell.col].moisture * 100).toFixed(1)
                          : (grid[selectedCell.row][selectedCell.col].moistureVolumetric).toFixed(3)
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          const newMoisture = moistureUnit === 'percentage' ? value / 100 : value / 0.5;
                          setMoisture(selectedCell.row, selectedCell.col, Math.min(1, Math.max(0, newMoisture)));
                        }
                      }}
                      className="w-20"
                    />
                    <span>{moistureUnit === 'percentage' ? '%' : 'm³/m³'}</span>
                  </div>
                </div>

                {/* Toggle Tap */}
                <Button onClick={() => toggleTap(selectedCell.row, selectedCell.col)}>
                  {grid[selectedCell.row][selectedCell.col].tapStatus ? 'Turn Tap Off' : 'Turn Tap On'}
                </Button>

                {/* Reset Tap Control */}
                <Button onClick={() => resetTapControl(selectedCell.row, selectedCell.col)}>
                  Reset Tap Control
                </Button>

                {/* Per-Cell Parameters */}
                {(['diffusionCoefficient', 'evapotranspirationRate', 'irrigationRate', 'moistureThreshold'] as const).map((param) => (
                  <div key={param} className="space-y-2">
                    <Label htmlFor={param}>{formatParameterName(param)}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id={param}
                        type="number"
                        min={0}
                        max={param === 'diffusionCoefficient' || param === 'moistureThreshold' ? 1 : 0.5}
                        step={0.01}
                        value={grid[selectedCell.row][selectedCell.col][param] ?? params[param]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            updateCellParameter(selectedCell.row, selectedCell.col, param, value);
                          }
                        }}
                        className="w-20"
                      />
                      <Button onClick={() => resetCellParameter(selectedCell.row, selectedCell.col, param)}>
                        Reset to Global
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </DialogDescription>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Simulation() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SimulationContent />
    </Suspense>
  );
}
