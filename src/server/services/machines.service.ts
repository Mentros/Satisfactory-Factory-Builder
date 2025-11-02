import Database from 'better-sqlite3';
import { getDatabase } from '../db/init';
import { DatabaseBuilding } from '../models/database.models';
import { MachineCategory } from '../../app/shared/models/machine.model';

export interface MachineResponse {
  id: string;
  name: string;
  description: string;
  category: MachineCategory;
  iconName: string;
  tier: number;
  powerConsumption?: number;
  powerProduction?: number;
  dimensions?: { width: number; height: number };
  maxConveyorBeltConnections?: number;
  maxPipeConnections?: number;
  recipes?: string[];
}

export class MachinesService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  getAllMachines(): MachineResponse[] {
    const rows = this.db
      .prepare('SELECT * FROM buildings ORDER BY tier, category, name')
      .all() as DatabaseBuilding[];

    return rows.map(this.mapRowToResponse);
  }

  getMachineById(id: string): MachineResponse | undefined {
    const row = this.db
      .prepare('SELECT * FROM buildings WHERE id = ?')
      .get(id) as DatabaseBuilding | undefined;

    return row ? this.mapRowToResponse(row) : undefined;
  }

  getMachinesByCategory(category: MachineCategory): MachineResponse[] {
    const rows = this.db
      .prepare('SELECT * FROM buildings WHERE category = ? ORDER BY tier, name')
      .all(category) as DatabaseBuilding[];

    return rows.map(this.mapRowToResponse);
  }

  getMachinesByTier(maxTier: number): MachineResponse[] {
    const rows = this.db
      .prepare('SELECT * FROM buildings WHERE tier <= ? ORDER BY tier, category, name')
      .all(maxTier) as DatabaseBuilding[];

    return rows.map(this.mapRowToResponse);
  }

  searchMachines(query: string): MachineResponse[] {
    const searchPattern = `%${query.toLowerCase()}%`;
    const rows = this.db
      .prepare(
        'SELECT * FROM buildings WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(id) LIKE ? ORDER BY tier, category, name'
      )
      .all(searchPattern, searchPattern, searchPattern) as DatabaseBuilding[];

    return rows.map(this.mapRowToResponse);
  }

  private mapRowToResponse(row: DatabaseBuilding): MachineResponse {
    const response: MachineResponse = {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category as MachineCategory,
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

