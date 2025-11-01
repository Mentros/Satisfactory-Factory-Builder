import { FactoryRecipe } from '../models/recipe.model';

/**
 * Test data for factory production recipes.
 * This will be replaced with database data later.
 */
export const factoryRecipesTestData: { [factoryId: string]: FactoryRecipe[] } = {
  'smelter': [
    {
      id: 'iron-ingot',
      name: 'Iron Ingot',
      inputs: [{ item: 'Iron Ore', amount: 30 }],
      outputs: [{ item: 'Iron Ingot', amount: 30 }],
      duration: 2
    },
    {
      id: 'copper-ingot',
      name: 'Copper Ingot',
      inputs: [{ item: 'Copper Ore', amount: 30 }],
      outputs: [{ item: 'Copper Ingot', amount: 30 }],
      duration: 2
    }
  ],
  'foundry': [
    {
      id: 'steel-ingot',
      name: 'Steel Ingot',
      inputs: [
        { item: 'Iron Ore', amount: 45 },
        { item: 'Coal', amount: 45 }
      ],
      outputs: [{ item: 'Steel Ingot', amount: 45 }],
      duration: 4
    },
    {
      id: 'solid-steel',
      name: 'Solid Steel Ingot',
      inputs: [
        { item: 'Iron Ingot', amount: 40 },
        { item: 'Coal', amount: 40 }
      ],
      outputs: [{ item: 'Steel Ingot', amount: 60 }],
      duration: 3
    }
  ],
  'constructor': [
    {
      id: 'iron-plate',
      name: 'Iron Plate',
      inputs: [{ item: 'Iron Ingot', amount: 30 }],
      outputs: [{ item: 'Iron Plate', amount: 20 }],
      duration: 6
    },
    {
      id: 'iron-rod',
      name: 'Iron Rod',
      inputs: [{ item: 'Iron Ingot', amount: 15 }],
      outputs: [{ item: 'Iron Rod', amount: 15 }],
      duration: 4
    },
    {
      id: 'screw',
      name: 'Screw',
      inputs: [{ item: 'Iron Rod', amount: 10 }],
      outputs: [{ item: 'Screw', amount: 40 }],
      duration: 6
    },
    {
      id: 'wire',
      name: 'Wire',
      inputs: [{ item: 'Copper Ingot', amount: 15 }],
      outputs: [{ item: 'Wire', amount: 30 }],
      duration: 4
    },
    {
      id: 'cable',
      name: 'Cable',
      inputs: [{ item: 'Wire', amount: 60 }],
      outputs: [{ item: 'Cable', amount: 30 }],
      duration: 2
    },
    {
      id: 'concrete',
      name: 'Concrete',
      inputs: [{ item: 'Limestone', amount: 45 }],
      outputs: [{ item: 'Concrete', amount: 15 }],
      duration: 4
    }
  ],
  'assembler': [
    {
      id: 'reinforced-plate',
      name: 'Reinforced Iron Plate',
      inputs: [
        { item: 'Iron Plate', amount: 30 },
        { item: 'Screw', amount: 60 }
      ],
      outputs: [{ item: 'Reinforced Iron Plate', amount: 5 }],
      duration: 12
    },
    {
      id: 'rotor',
      name: 'Rotor',
      inputs: [
        { item: 'Iron Rod', amount: 20 },
        { item: 'Screw', amount: 100 }
      ],
      outputs: [{ item: 'Rotor', amount: 4 }],
      duration: 15
    },
    {
      id: 'modular-frame',
      name: 'Modular Frame',
      inputs: [
        { item: 'Reinforced Iron Plate', amount: 12 },
        { item: 'Iron Rod', amount: 24 }
      ],
      outputs: [{ item: 'Modular Frame', amount: 2 }],
      duration: 60
    },
    {
      id: 'steel-beam',
      name: 'Steel Beam',
      inputs: [{ item: 'Steel Ingot', amount: 60 }],
      outputs: [{ item: 'Steel Beam', amount: 15 }],
      duration: 4
    },
    {
      id: 'steel-pipe',
      name: 'Steel Pipe',
      inputs: [{ item: 'Steel Ingot', amount: 30 }],
      outputs: [{ item: 'Steel Pipe', amount: 20 }],
      duration: 6
    }
  ],
  'manufacturer': [
    {
      id: 'motor',
      name: 'Motor',
      inputs: [
        { item: 'Rotor', amount: 10 },
        { item: 'Stator', amount: 10 }
      ],
      outputs: [{ item: 'Motor', amount: 5 }],
      duration: 15
    },
    {
      id: 'heavy-modular-frame',
      name: 'Heavy Modular Frame',
      inputs: [
        { item: 'Modular Frame', amount: 10 },
        { item: 'Steel Pipe', amount: 30 },
        { item: 'Encased Industrial Beam', amount: 10 },
        { item: 'Screw', amount: 200 }
      ],
      outputs: [{ item: 'Heavy Modular Frame', amount: 2 }],
      duration: 30
    },
    {
      id: 'computer',
      name: 'Computer',
      inputs: [
        { item: 'Circuit Board', amount: 25 },
        { item: 'Cable', amount: 22 },
        { item: 'Plastic', amount: 45 },
        { item: 'Screw', amount: 130 }
      ],
      outputs: [{ item: 'Computer', amount: 2.5 }],
      duration: 25
    },
    {
      id: 'ai-limiter',
      name: 'AI Limiter',
      inputs: [
        { item: 'Copper Sheet', amount: 25 },
        { item: 'Quickwire', amount: 100 }
      ],
      outputs: [{ item: 'AI Limiter', amount: 5 }],
      duration: 12
    }
  ],
  'refinery': [
    {
      id: 'plastic',
      name: 'Plastic',
      inputs: [{ item: 'Crude Oil', amount: 30 }],
      outputs: [
        { item: 'Plastic', amount: 20 },
        { item: 'Heavy Oil Residue', amount: 10 }
      ],
      duration: 6
    },
    {
      id: 'rubber',
      name: 'Rubber',
      inputs: [{ item: 'Crude Oil', amount: 30 }],
      outputs: [
        { item: 'Rubber', amount: 20 },
        { item: 'Heavy Oil Residue', amount: 10 }
      ],
      duration: 6
    },
    {
      id: 'fuel',
      name: 'Fuel',
      inputs: [{ item: 'Crude Oil', amount: 60 }],
      outputs: [
        { item: 'Fuel', amount: 40 },
        { item: 'Polymer Resin', amount: 30 }
      ],
      duration: 6
    },
    {
      id: 'liquid-biofuel',
      name: 'Liquid Biofuel',
      inputs: [{ item: 'Biomass', amount: 60 }],
      outputs: [{ item: 'Liquid Biofuel', amount: 40 }],
      duration: 4
    }
  ],
  'packager': [
    {
      id: 'pack-water',
      name: 'Pack Water',
      inputs: [
        { item: 'Water', amount: 60 },
        { item: 'Empty Canister', amount: 60 }
      ],
      outputs: [{ item: 'Packaged Water', amount: 60 }],
      duration: 1
    },
    {
      id: 'unpack-water',
      name: 'Unpack Water',
      inputs: [{ item: 'Packaged Water', amount: 60 }],
      outputs: [
        { item: 'Water', amount: 60 },
        { item: 'Empty Canister', amount: 60 }
      ],
      duration: 1
    },
    {
      id: 'pack-fuel',
      name: 'Pack Fuel',
      inputs: [
        { item: 'Fuel', amount: 40 },
        { item: 'Empty Canister', amount: 40 }
      ],
      outputs: [{ item: 'Packaged Fuel', amount: 40 }],
      duration: 2
    }
  ],
  'blender': [
    {
      id: 'blended-turbofuel',
      name: 'Blended Turbofuel',
      inputs: [
        { item: 'Heavy Oil Residue', amount: 37.5 },
        { item: 'Fuel', amount: 30 }
      ],
      outputs: [{ item: 'Turbofuel', amount: 30 }],
      duration: 8
    },
    {
      id: 'cooling-system',
      name: 'Cooling System',
      inputs: [
        { item: 'Heat Sink', amount: 12 },
        { item: 'Rubber', amount: 12 },
        { item: 'Water', amount: 36 },
        { item: 'Nitrogen Gas', amount: 150 }
      ],
      outputs: [{ item: 'Cooling System', amount: 6 }],
      duration: 32
    },
    {
      id: 'fused-modular-frame',
      name: 'Fused Modular Frame',
      inputs: [
        { item: 'Heavy Modular Frame', amount: 2 },
        { item: 'Aluminum Casing', amount: 50 },
        { item: 'Nitrogen Gas', amount: 100 }
      ],
      outputs: [{ item: 'Fused Modular Frame', amount: 1 }],
      duration: 16
    }
  ]
};

