import { FactoryBuildRequirements } from '../models/build-requirement.model';

/**
 * Test data for factory build requirements.
 * This will be replaced with database data later.
 */
export const factoryBuildRequirementsTestData: FactoryBuildRequirements = {
  // Extraction
  'miner-mk1': [
    { item: 'Iron Plate', amount: 1 },
    { item: 'Wire', amount: 5 }
  ],
  'miner-mk2': [
    { item: 'Steel Pipe', amount: 3 },
    { item: 'Wire', amount: 15 },
    { item: 'Cable', amount: 5 }
  ],
  'miner-mk3': [
    { item: 'Steel Beam', amount: 5 },
    { item: 'Steel Pipe', amount: 10 },
    { item: 'Wire', amount: 30 },
    { item: 'Cable', amount: 15 },
    { item: 'Modular Frame', amount: 2 }
  ],
  'water-extractor': [
    { item: 'Iron Plate', amount: 5 },
    { item: 'Wire', amount: 20 },
    { item: 'Concrete', amount: 10 }
  ],
  'oil-extractor': [
    { item: 'Steel Pipe', amount: 8 },
    { item: 'Wire', amount: 50 },
    { item: 'Cable', amount: 20 },
    { item: 'Concrete', amount: 15 }
  ],

  // Production - Smelting
  'smelter': [
    { item: 'Iron Plate', amount: 5 },
    { item: 'Wire', amount: 25 }
  ],
  'foundry': [
    { item: 'Steel Pipe', amount: 10 },
    { item: 'Wire', amount: 40 },
    { item: 'Concrete', amount: 20 }
  ],

  // Production - Manufacturing
  'constructor': [
    { item: 'Iron Plate', amount: 3 },
    { item: 'Wire', amount: 15 }
  ],
  'assembler': [
    { item: 'Steel Beam', amount: 4 },
    { item: 'Steel Pipe', amount: 10 },
    { item: 'Wire', amount: 50 },
    { item: 'Cable', amount: 25 }
  ],
  'manufacturer': [
    { item: 'Steel Beam', amount: 10 },
    { item: 'Steel Pipe', amount: 20 },
    { item: 'Wire', amount: 100 },
    { item: 'Cable', amount: 50 },
    { item: 'Concrete', amount: 50 }
  ],

  // Production - Fluids
  'refinery': [
    { item: 'Steel Pipe', amount: 15 },
    { item: 'Wire', amount: 75 },
    { item: 'Cable', amount: 30 },
    { item: 'Concrete', amount: 30 }
  ],
  'packager': [
    { item: 'Steel Pipe', amount: 10 },
    { item: 'Wire', amount: 40 },
    { item: 'Cable', amount: 10 }
  ],
  'blender': [
    { item: 'Steel Beam', amount: 15 },
    { item: 'Steel Pipe', amount: 25 },
    { item: 'Wire', amount: 150 },
    { item: 'Cable', amount: 75 },
    { item: 'Aluminum Casing', amount: 50 }
  ],

  // Power
  'biomass-burner': [
    { item: 'Iron Plate', amount: 2 },
    { item: 'Wire', amount: 10 }
  ],
  'coal-generator': [
    { item: 'Steel Pipe', amount: 5 },
    { item: 'Wire', amount: 30 },
    { item: 'Cable', amount: 10 },
    { item: 'Concrete', amount: 20 }
  ],
  'fuel-generator': [
    { item: 'Steel Beam', amount: 8 },
    { item: 'Steel Pipe', amount: 15 },
    { item: 'Wire', amount: 60 },
    { item: 'Cable', amount: 30 },
    { item: 'Concrete', amount: 25 }
  ],
  'nuclear-power-plant': [
    { item: 'Steel Beam', amount: 100 },
    { item: 'Steel Pipe', amount: 200 },
    { item: 'Wire', amount: 500 },
    { item: 'Cable', amount: 250 },
    { item: 'Concrete', amount: 500 },
    { item: 'Aluminum Casing', amount: 100 },
    { item: 'Encased Industrial Beam', amount: 50 }
  ],

  // Storage
  'storage-container': [
    { item: 'Iron Plate', amount: 2 },
    { item: 'Wire', amount: 5 }
  ],
  'industrial-storage-container': [
    { item: 'Steel Beam', amount: 5 },
    { item: 'Steel Pipe', amount: 10 },
    { item: 'Wire', amount: 40 },
    { item: 'Cable', amount: 20 },
    { item: 'Concrete', amount: 30 }
  ],
  'fluid-buffer': [
    { item: 'Iron Plate', amount: 3 },
    { item: 'Steel Pipe', amount: 5 },
    { item: 'Wire', amount: 15 }
  ],
  'industrial-fluid-buffer': [
    { item: 'Steel Beam', amount: 8 },
    { item: 'Steel Pipe', amount: 15 },
    { item: 'Wire', amount: 60 },
    { item: 'Cable', amount: 30 },
    { item: 'Concrete', amount: 25 }
  ],

  // Logistics
  'conveyor-splitter': [
    { item: 'Iron Plate', amount: 1 },
    { item: 'Wire', amount: 2 }
  ],
  'conveyor-merger': [
    { item: 'Iron Plate', amount: 1 },
    { item: 'Wire', amount: 2 }
  ]
};

