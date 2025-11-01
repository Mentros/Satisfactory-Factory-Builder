import {
  faIndustry,
  faCogs,
  faBolt,
  faCubes,
  faFlask,
  faBox,
  faWarehouse,
  faOilCan,
  faAtom,
  faNetworkWired
} from '@fortawesome/free-solid-svg-icons';
import { BuildingDefinition } from '../models/building.model';

/**
 * Test data for buildings.
 * This will be replaced with database data later.
 */
export const buildingsTestData: BuildingDefinition[] = [
  // Extraction
  {
    id: 'miner-mk1',
    name: 'Miner Mk.1',
    description: 'Basic ore extraction building',
    category: 'extraction',
    icon: faIndustry,
    tier: 0,
    powerConsumption: 5,
    dimensions: { width: 2, height: 2 }
  },
  {
    id: 'miner-mk2',
    name: 'Miner Mk.2',
    description: 'Improved ore extraction building',
    category: 'extraction',
    icon: faIndustry,
    tier: 4,
    powerConsumption: 12,
    dimensions: { width: 2, height: 2 }
  },
  {
    id: 'miner-mk3',
    name: 'Miner Mk.3',
    description: 'Advanced ore extraction building',
    category: 'extraction',
    icon: faIndustry,
    tier: 8,
    powerConsumption: 30,
    dimensions: { width: 2, height: 2 }
  },
  {
    id: 'water-extractor',
    name: 'Water Extractor',
    description: 'Extracts water from bodies of water',
    category: 'extraction',
    icon: faOilCan,
    tier: 1,
    powerConsumption: 20,
    dimensions: { width: 4, height: 4 }
  },
  {
    id: 'oil-extractor',
    name: 'Oil Extractor',
    description: 'Extracts crude oil from oil nodes',
    category: 'extraction',
    icon: faOilCan,
    tier: 3,
    powerConsumption: 40,
    dimensions: { width: 4, height: 4 }
  },

  // Production - Smelting
  {
    id: 'smelter',
    name: 'Smelter',
    description: 'Smelts ores into ingots',
    category: 'production',
    icon: faCogs,
    tier: 0,
    powerConsumption: 4,
    dimensions: { width: 2, height: 2 },
    maxConveyorBeltConnections: 2
  },
  {
    id: 'foundry',
    name: 'Foundry',
    description: 'Smelts ores using alternative recipes',
    category: 'production',
    icon: faCogs,
    tier: 3,
    powerConsumption: 16,
    dimensions: { width: 2, height: 2 },
    maxConveyorBeltConnections: 4
  },

  // Production - Manufacturing
  {
    id: 'constructor',
    name: 'Constructor',
    description: 'Basic manufacturing building',
    category: 'production',
    icon: faCogs,
    tier: 0,
    powerConsumption: 4,
    dimensions: { width: 2, height: 2 },
    maxConveyorBeltConnections: 2
  },
  {
    id: 'assembler',
    name: 'Assembler',
    description: 'Advanced manufacturing building',
    category: 'production',
    icon: faCogs,
    tier: 2,
    powerConsumption: 15,
    dimensions: { width: 4, height: 4 },
    maxConveyorBeltConnections: 4
  },
  {
    id: 'manufacturer',
    name: 'Manufacturer',
    description: 'Complex manufacturing building',
    category: 'production',
    icon: faCogs,
    tier: 4,
    powerConsumption: 55,
    dimensions: { width: 4, height: 4 },
    maxConveyorBeltConnections: 4
  },
  {
    id: 'refinery',
    name: 'Refinery',
    description: 'Refines oil and other fluids',
    category: 'production',
    icon: faFlask,
    tier: 3,
    powerConsumption: 30,
    dimensions: { width: 4, height: 4 },
    maxConveyorBeltConnections: 3,
    maxPipeConnections: 2
  },
  {
    id: 'packager',
    name: 'Packager',
    description: 'Packages and unpacks fluids',
    category: 'production',
    icon: faBox,
    tier: 3,
    powerConsumption: 10,
    dimensions: { width: 2, height: 2 },
    maxConveyorBeltConnections: 2,
    maxPipeConnections: 2
  },
  {
    id: 'blender',
    name: 'Blender',
    description: 'Advanced fluid processing',
    category: 'production',
    icon: faFlask,
    tier: 6,
    powerConsumption: 75,
    dimensions: { width: 4, height: 4 },
    maxConveyorBeltConnections: 4,
    maxPipeConnections: 2
  },

  // Power
  {
    id: 'biomass-burner',
    name: 'Biomass Burner',
    description: 'Basic power generation',
    category: 'power',
    icon: faBolt,
    tier: 0,
    powerProduction: 30,
    dimensions: { width: 2, height: 2 }
  },
  {
    id: 'coal-generator',
    name: 'Coal Generator',
    description: 'Coal-powered generator',
    category: 'power',
    icon: faBolt,
    tier: 3,
    powerProduction: 75,
    powerConsumption: 0, // Water consumption handled separately
    dimensions: { width: 4, height: 4 }
  },
  {
    id: 'fuel-generator',
    name: 'Fuel Generator',
    description: 'Fuel-powered generator',
    category: 'power',
    icon: faBolt,
    tier: 4,
    powerProduction: 150,
    dimensions: { width: 4, height: 4 }
  },
  {
    id: 'nuclear-power-plant',
    name: 'Nuclear Power Plant',
    description: 'Advanced nuclear power generation',
    category: 'power',
    icon: faAtom,
    tier: 8,
    powerProduction: 2500,
    dimensions: { width: 6, height: 6 }
  },

  // Storage
  {
    id: 'storage-container',
    name: 'Storage Container',
    description: 'Basic storage for items',
    category: 'storage',
    icon: faCubes,
    tier: 0,
    dimensions: { width: 2, height: 2 }
  },
  {
    id: 'industrial-storage-container',
    name: 'Industrial Storage Container',
    description: 'Large storage for items',
    category: 'storage',
    icon: faWarehouse,
    tier: 2,
    dimensions: { width: 4, height: 4 }
  },
  {
    id: 'fluid-buffer',
    name: 'Fluid Buffer',
    description: 'Storage for fluids',
    category: 'storage',
    icon: faBox,
    tier: 3,
    dimensions: { width: 2, height: 2 },
    maxPipeConnections: 2
  },
  {
    id: 'industrial-fluid-buffer',
    name: 'Industrial Fluid Buffer',
    description: 'Large storage for fluids',
    category: 'storage',
    icon: faBox,
    tier: 6,
    dimensions: { width: 4, height: 4 },
    maxPipeConnections: 4
  },

  // Logistics
  {
    id: 'conveyor-splitter',
    name: 'Conveyor Splitter',
    description: 'Splits conveyor belt flow',
    category: 'logistics',
    icon: faNetworkWired,
    tier: 0,
    dimensions: { width: 1, height: 1 }
  },
  {
    id: 'conveyor-merger',
    name: 'Conveyor Merger',
    description: 'Merges conveyor belt flow',
    category: 'logistics',
    icon: faNetworkWired,
    tier: 0,
    dimensions: { width: 1, height: 1 }
  }
];

