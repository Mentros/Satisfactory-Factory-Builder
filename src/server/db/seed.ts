import { getDatabase } from './init';
import Database from 'better-sqlite3';
import { machinesTestData } from '../../app/shared/testdata/buildings.testdata';
import { factoryRecipesTestData } from '../../app/shared/testdata/factory-recipes.testdata';
import { factoryBuildRequirementsTestData } from '../../app/shared/testdata/factory-build-requirements.testdata';

// Map FontAwesome icon objects to their names
// Since we can't import icons in the backend, we'll extract names from the icon definitions
function getIconName(icon: any): string {
  // FontAwesome icons have a `iconName` property
  // If that doesn't work, we'll need to match by other properties
  // For now, create a manual mapping based on the test data
  const iconMap: Record<string, string> = {
    'faIndustry': 'industry',
    'faCogs': 'cogs',
    'faBolt': 'bolt',
    'faCubes': 'cubes',
    'faFlask': 'flask',
    'faBox': 'box',
    'faWarehouse': 'warehouse',
    'faOilCan': 'oil-can',
    'faAtom': 'atom',
    'faNetworkWired': 'network-wired',
  };

  // Try to extract from icon object properties
  const iconKey = Object.keys(iconMap).find((key) => {
    // Check if the icon matches (this is a simplified approach)
    return icon.iconName || icon;
  });

  // For now, we'll need to pass icon names manually or use a different approach
  // Let's create a helper that matches based on machine id/category
  return getIconNameByMachine(icon);
}

function getIconNameByMachine(iconObj: any): string {
  // Since we can't easily extract icon names from FontAwesome objects in backend,
  // we'll create a mapping based on what we know from the test data structure
  // This is a workaround - in a real scenario, you might store icon names differently
  const machineIconMap: Record<string, string> = {
    // Extraction
    'miner-mk1': 'industry',
    'miner-mk2': 'industry',
    'miner-mk3': 'industry',
    'water-extractor': 'oil-can',
    'oil-extractor': 'oil-can',
    // Production
    'smelter': 'cogs',
    'foundry': 'cogs',
    'constructor': 'cogs',
    'assembler': 'cogs',
    'manufacturer': 'cogs',
    'refinery': 'flask',
    'packager': 'box',
    'blender': 'flask',
    // Power
    'biomass-burner': 'bolt',
    'coal-generator': 'bolt',
    'fuel-generator': 'bolt',
    'nuclear-power-plant': 'atom',
    // Storage
    'storage-container': 'cubes',
    'industrial-storage-container': 'warehouse',
    'fluid-buffer': 'box',
    'industrial-fluid-buffer': 'box',
    // Logistics
    'conveyor-splitter': 'network-wired',
    'conveyor-merger': 'network-wired',
  };

  // Since we're calling this from machine data, we need a different approach
  // Let's create a function that takes the icon object and tries to match it
  return 'cogs'; // Default fallback
}

// Create icon name mapping function based on machine definitions
function getIconNameForMachine(machineId: string, category: string): string {
  const iconMap: Record<string, string> = {
    // Extraction
    'miner-mk1': 'industry',
    'miner-mk2': 'industry',
    'miner-mk3': 'industry',
    'water-extractor': 'oil-can',
    'oil-extractor': 'oil-can',
    // Production - smelting/manufacturing
    'smelter': 'cogs',
    'foundry': 'cogs',
    'constructor': 'cogs',
    'assembler': 'cogs',
    'manufacturer': 'cogs',
    // Production - fluids
    'refinery': 'flask',
    'packager': 'box',
    'blender': 'flask',
    // Power
    'biomass-burner': 'bolt',
    'coal-generator': 'bolt',
    'fuel-generator': 'bolt',
    'nuclear-power-plant': 'atom',
    // Storage
    'storage-container': 'cubes',
    'industrial-storage-container': 'warehouse',
    'fluid-buffer': 'box',
    'industrial-fluid-buffer': 'box',
    // Logistics
    'conveyor-splitter': 'network-wired',
    'conveyor-merger': 'network-wired',
  };

  return iconMap[machineId] || 'cogs';
}

export function seedDatabase(): void {
  const db = getDatabase();
  
  // Start transaction for better performance
  // Note: Still using 'buildings' table name until database migration
  const insertBuilding = db.prepare(`
    INSERT OR REPLACE INTO buildings (
      id, name, description, category, icon_name, tier,
      power_consumption, power_production, width, height,
      max_conveyor_belt_connections, max_pipe_connections, recipes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRecipe = db.prepare(`
    INSERT OR REPLACE INTO recipes (id, factory_id, name, duration)
    VALUES (?, ?, ?, ?)
  `);

  const insertRecipeItem = db.prepare(`
    INSERT OR REPLACE INTO recipe_items (recipe_id, item, amount, is_input)
    VALUES (?, ?, ?, ?)
  `);

  const insertBuildRequirement = db.prepare(`
    INSERT OR REPLACE INTO build_requirements (factory_id, item, amount)
    VALUES (?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    // Insert machines (still using buildings table name until migration)
    for (const machine of machinesTestData) {
      const iconName = getIconNameForMachine(machine.id, machine.category);
      const recipesJson = machine.recipes ? JSON.stringify(machine.recipes) : null;

      insertBuilding.run(
        machine.id,
        machine.name,
        machine.description,
        machine.category,
        iconName,
        machine.tier,
        machine.powerConsumption ?? null,
        machine.powerProduction ?? null,
        machine.dimensions?.width ?? null,
        machine.dimensions?.height ?? null,
        machine.maxConveyorBeltConnections ?? null,
        machine.maxPipeConnections ?? null,
        recipesJson
      );
    }

    // Insert recipes
    for (const [factoryId, recipes] of Object.entries(factoryRecipesTestData)) {
      for (const recipe of recipes) {
        insertRecipe.run(recipe.id, factoryId, recipe.name, recipe.duration);

        // Insert recipe inputs
        for (const input of recipe.inputs) {
          insertRecipeItem.run(recipe.id, input.item, input.amount, 1);
        }

        // Insert recipe outputs
        for (const output of recipe.outputs) {
          insertRecipeItem.run(recipe.id, output.item, output.amount, 0);
        }
      }
    }

    // Insert build requirements
    for (const [factoryId, requirements] of Object.entries(factoryBuildRequirementsTestData)) {
      for (const requirement of requirements) {
        insertBuildRequirement.run(factoryId, requirement.item, requirement.amount);
      }
    }
  });

  transaction();

  console.log('Database seeded successfully');
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

