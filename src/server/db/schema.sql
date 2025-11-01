-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 0,
  power_consumption REAL,
  power_production REAL,
  width INTEGER,
  height INTEGER,
  max_conveyor_belt_connections INTEGER,
  max_pipe_connections INTEGER,
  recipes TEXT -- JSON array of recipe IDs
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  factory_id TEXT NOT NULL,
  name TEXT NOT NULL,
  duration REAL NOT NULL,
  FOREIGN KEY (factory_id) REFERENCES buildings(id) ON DELETE CASCADE
);

-- Recipe items table (inputs and outputs)
CREATE TABLE IF NOT EXISTS recipe_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id TEXT NOT NULL,
  item TEXT NOT NULL,
  amount REAL NOT NULL,
  is_input INTEGER NOT NULL DEFAULT 1, -- 1 for input, 0 for output
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Build requirements table
CREATE TABLE IF NOT EXISTS build_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factory_id TEXT NOT NULL,
  item TEXT NOT NULL,
  amount REAL NOT NULL,
  FOREIGN KEY (factory_id) REFERENCES buildings(id) ON DELETE CASCADE
);

-- Placed buildings table (planner layouts)
CREATE TABLE IF NOT EXISTS placed_buildings (
  id TEXT PRIMARY KEY,
  building_id TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (building_id) REFERENCES buildings(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_buildings_category ON buildings(category);
CREATE INDEX IF NOT EXISTS idx_buildings_tier ON buildings(tier);
CREATE INDEX IF NOT EXISTS idx_recipes_factory_id ON recipes(factory_id);
CREATE INDEX IF NOT EXISTS idx_recipe_items_recipe_id ON recipe_items(recipe_id);
CREATE INDEX IF NOT EXISTS idx_build_requirements_factory_id ON build_requirements(factory_id);

