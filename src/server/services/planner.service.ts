import Database from 'better-sqlite3';
import { getDatabase } from '../db/init';
import { DatabasePlacedBuilding } from '../models/database.models';
import { PlacedBuilding } from '../../app/shared/services/planner.service';

export class PlannerService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  getAll(): PlacedBuilding[] {
    const rows = this.db
      .prepare('SELECT id, building_id, x, y FROM placed_buildings ORDER BY created_at')
      .all() as DatabasePlacedBuilding[];

    return rows.map((row) => ({
      id: row.id,
      buildingId: row.building_id,
      x: row.x,
      y: row.y,
    }));
  }

  add(buildingId: string, x: number, y: number): PlacedBuilding {
    const id = `${buildingId}-${crypto.randomUUID()}`;
    const stmt = this.db.prepare(
      'INSERT INTO placed_buildings (id, building_id, x, y) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, buildingId, x, y);

    return { id, buildingId, x, y };
  }

  update(id: string, x: number, y: number): void {
    const stmt = this.db.prepare('UPDATE placed_buildings SET x = ?, y = ? WHERE id = ?');
    stmt.run(x, y, id);
  }

  remove(id: string): void {
    const stmt = this.db.prepare('DELETE FROM placed_buildings WHERE id = ?');
    stmt.run(id);
  }

  clear(): void {
    this.db.prepare('DELETE FROM placed_buildings').run();
  }
}

