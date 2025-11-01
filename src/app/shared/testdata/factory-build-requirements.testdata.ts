import { FactoryBuildRequirements } from '../models/build-requirement.model';

/**
 * Test data for factory build requirements.
 * This will be replaced with database data later.
 */
export const factoryBuildRequirementsTestData: FactoryBuildRequirements = {
  'smelter': [
    { item: 'Iron Plate', amount: 5 },
    { item: 'Wire', amount: 25 }
  ],
  'foundry': [
    { item: 'Steel Pipe', amount: 10 },
    { item: 'Wire', amount: 40 },
    { item: 'Concrete', amount: 20 }
  ],
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
  ]
};

