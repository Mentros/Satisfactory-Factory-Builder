import Database from 'better-sqlite3';
import { getDatabase } from '../db/init';
import { DatabaseBuilding } from '../models/database.models';
import { BuildingCategory } from '../../app/shared/models/building.model';

export interface BuildingResponse {
  id: string;
  name: string;
  description: string;
  category: BuildingCategory;
  iconName: string;
  tier: number;
  powerConsumption?: number;
  powerProduction?: number;
  dimensions?: { width: number; height: number };
  maxConveyorBeltConnections?: number;
  maxPipeConnections?: number;
  recipes?: string[];
}

export class BuildingsService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  getAllBuildings(): BuildingResponse[] {
    const rows = this.db
      .prepare('SELECT * FROM buildings ORDER BY tier, category, name')
      .all() as DatabaseBuilding[];

    return rows.map(this.mapRowToResponse);
  }

  getBuildingById(id: string): BuildingResponse | undefined {
    const row = this.db
      .prepare('SELECT * FROM buildings WHERE id = ?')
      .get(id) as DatabaseBuilding | undefined;

    return row ? this.mapRowToResponse(row) : undefined;
  }

  getBuildingsByCategory(category: BuildingCategory): BuildingResponse[] {
    const rows = this.db
      .prepare('SELECT * FROM buildings WHERE category = ? ORDER BY tier, name')
      .all(category) as DatabaseBuilding[];

    return rows.map(this.mapRowToResponse);
  }

  getBuildingsByTier(maxTier: number): BuildingResponse[] {
    const rows = this.db
      .prepare('SELECT * FROM buildings WHERE tier <= ? ORDER BY tier, category, name')
      .all(maxTier) as DatabaseBuilding[];

    return rows.map(this.mapRowToResponse);
  }

  searchBuildings(query: string): BuildingResponse[] {
    const searchPattern = `%${query.toLowerCase()}%`;
    const rows = this.db
      .prepare(
        'SELECT * FROM buildings WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(id) LIKE ? ORDER BY tier, category, name'
      )
      .all(searchPattern, searchPattern, searchPattern) as DatabaseBuilding[];

    return rows.map(this.mapRowToResponse);
  }

  private mapRowToResponse(row: DatabaseBuilding): BuildingResponse {
    const response: BuildingResponse = {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category as BuildingCategory,
      iconName: row.icon_name,
      tier: row.tier,
    };

    if (row.power_consumption !== null) {
      response.powerConsumption = row.power_consumption;
    }

    if (row.power_production !== null) {
      response.powerProduction = row.power_production;
    }

    if (row.width !== null && row.height !== null) {
      response.dimensions = { width: row.width, height: row.height };
    }

    if (row.max_conveyor_belt_connections !== null) {
      response.maxConveyorBeltConnections = row.max_conveyor_belt_connections;
    }

    if (row.max_pipe_connections !== null) {
      response.maxPipeConnections = row.max_pipe_connections;
    }

    if (row.recipes) {
      try {
        response.recipes = JSON.parse(row.recipes);
      } catch {
        // ignore invalid JSON
      }
    }

    return response;
  }
}

