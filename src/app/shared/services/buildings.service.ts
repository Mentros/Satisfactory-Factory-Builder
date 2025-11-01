import { Injectable } from '@angular/core';
import { BuildingDefinition, BuildingCategory } from '../models/building.model';
import { buildingsTestData } from '../testdata/buildings.testdata';

@Injectable({ providedIn: 'root' })
export class BuildingsService {
  private readonly buildings: Map<string, BuildingDefinition>;

  constructor() {
    // Initialize buildings map from test data
    // This will be replaced with database data later
    this.buildings = new Map(
      buildingsTestData.map(building => [building.id, building])
    );
  }

  getAllBuildings(): BuildingDefinition[] {
    return Array.from(this.buildings.values());
  }

  getBuildingById(id: string): BuildingDefinition | undefined {
    return this.buildings.get(id);
  }

  getBuildingsByCategory(category: BuildingCategory): BuildingDefinition[] {
    return this.getAllBuildings().filter(b => b.category === category);
  }

  getBuildingsByTier(maxTier: number): BuildingDefinition[] {
    return this.getAllBuildings().filter(b => b.tier <= maxTier);
  }

  searchBuildings(query: string): BuildingDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllBuildings().filter(b => 
      b.name.toLowerCase().includes(lowerQuery) ||
      b.description.toLowerCase().includes(lowerQuery) ||
      b.id.toLowerCase().includes(lowerQuery)
    );
  }
}

