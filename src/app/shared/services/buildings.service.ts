import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BuildingDefinition, BuildingCategory } from '../models/building.model';
import { getIconByName } from '../utils/icon-mapper';
import { firstValueFrom } from 'rxjs';

interface BuildingApiResponse {
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

@Injectable({ providedIn: 'root' })
export class BuildingsService {
  readonly buildingsCache = signal<Map<string, BuildingDefinition>>(new Map());
  private readonly http = inject(HttpClient);
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.loadBuildings();
  }

  private async loadBuildings(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      try {
        const response = await firstValueFrom(
          this.http.get<BuildingApiResponse[]>('/api/buildings')
        );
        const buildings = response.map(this.mapApiResponseToBuilding);
        this.buildingsCache.set(new Map(buildings.map(b => [b.id, b])));
      } catch (error) {
        console.error('Failed to load buildings:', error);
        // Fallback to empty map on error
        this.buildingsCache.set(new Map());
      }
    })();

    return this.loadPromise;
  }

  private mapApiResponseToBuilding(apiBuilding: BuildingApiResponse): BuildingDefinition {
    const building: BuildingDefinition = {
      id: apiBuilding.id,
      name: apiBuilding.name,
      description: apiBuilding.description,
      category: apiBuilding.category,
      icon: getIconByName(apiBuilding.iconName),
      tier: apiBuilding.tier,
    };

    if (apiBuilding.powerConsumption !== undefined) {
      building.powerConsumption = apiBuilding.powerConsumption;
    }

    if (apiBuilding.powerProduction !== undefined) {
      building.powerProduction = apiBuilding.powerProduction;
    }

    if (apiBuilding.dimensions) {
      building.dimensions = apiBuilding.dimensions;
    }

    if (apiBuilding.maxConveyorBeltConnections !== undefined) {
      building.maxConveyorBeltConnections = apiBuilding.maxConveyorBeltConnections;
    }

    if (apiBuilding.maxPipeConnections !== undefined) {
      building.maxPipeConnections = apiBuilding.maxPipeConnections;
    }

    if (apiBuilding.recipes) {
      building.recipes = apiBuilding.recipes;
    }

    return building;
  }

  getAllBuildings(): BuildingDefinition[] {
    return Array.from(this.buildingsCache().values());
  }

  getBuildingById(id: string): BuildingDefinition | undefined {
    return this.buildingsCache().get(id);
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

