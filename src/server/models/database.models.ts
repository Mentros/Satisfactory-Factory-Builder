// Database entity interfaces (matching database schema)

export interface DatabaseBuilding {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_name: string;
  tier: number;
  power_consumption: number | null;
  power_production: number | null;
  width: number | null;
  height: number | null;
  max_conveyor_belt_connections: number | null;
  max_pipe_connections: number | null;
  recipes: string | null; // JSON array string
}

export interface DatabaseRecipe {
  id: string;
  factory_id: string;
  name: string;
  duration: number;
}

export interface DatabaseRecipeItem {
  id: number;
  recipe_id: string;
  item: string;
  amount: number;
  is_input: number; // 1 for input, 0 for output
}

export interface DatabaseBuildRequirement {
  id: number;
  factory_id: string;
  item: string;
  amount: number;
}

export interface DatabasePlacedBuilding {
  id: string;
  building_id: string;
  x: number;
  y: number;
  created_at: string;
}

