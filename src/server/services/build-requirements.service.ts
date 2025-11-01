import Database from 'better-sqlite3';
import { getDatabase } from '../db/init';
import { DatabaseBuildRequirement } from '../models/database.models';
import { BuildRequirement } from '../../app/shared/models/build-requirement.model';

export class BuildRequirementsService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  getBuildRequirementsByFactory(factoryId: string): BuildRequirement[] {
    const rows = this.db
      .prepare('SELECT * FROM build_requirements WHERE factory_id = ? ORDER BY item')
      .all(factoryId) as DatabaseBuildRequirement[];

    return rows.map((row) => ({
      item: row.item,
      amount: row.amount,
    }));
  }
}

