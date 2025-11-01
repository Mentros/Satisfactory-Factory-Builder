import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { PlannerService, PlacedBuilding } from './planner.service';
import { BuildingsService } from './buildings.service';
import { BuildingDefinition } from '../models/building.model';
import { FactoryRecipe } from '../models/recipe.model';
import { BuildRequirement } from '../models/build-requirement.model';

@Injectable({ providedIn: 'root' })
export class FactoriesService {
  private readonly http = inject(HttpClient);

  // Reactive signals for httpResource params
  readonly buildRequirementsFactoryId = signal<string | null>(null);
  readonly recipesFactoryId = signal<string | null>(null);

  // httpResource for build requirements
  readonly buildRequirementsResource = httpResource<BuildRequirement[]>(() => {
    const factoryId = this.buildRequirementsFactoryId();
    if (!factoryId) return undefined;
    return `/api/build-requirements/${factoryId}`;
  });

  // httpResource for recipes
  readonly recipesResource = httpResource<FactoryRecipe[]>(() => {
    const factoryId = this.recipesFactoryId();
    if (!factoryId) return undefined;
    return `/api/recipes/${factoryId}`;
  });

  /**
   * Set the factory ID to fetch build requirements for
   */
  loadBuildRequirements(factoryId: string): void {
    this.buildRequirementsFactoryId.set(factoryId);
  }

  /**
   * Set the factory ID to fetch recipes for
   */
  loadRecipes(factoryId: string): void {
    this.recipesFactoryId.set(factoryId);
  }

  constructor(
    private readonly planner: PlannerService,
    private readonly buildingsService: BuildingsService
  ) {}

  /**
   * Get all placed factories (production buildings)
   */
  factories(): PlacedBuilding[] {
    return this.planner.placed().filter(b => {
      const building = this.buildingsService.getBuildingById(b.buildingId);
      return building?.category === 'production';
    });
  }

  /**
   * Get the count of placed factories
   */
  factoriesCount(): number {
    return this.factories().length;
  }

  /**
   * Get the icon for a placed building
   */
  iconFor(building: PlacedBuilding): IconDefinition {
    const buildingDef = this.buildingsService.getBuildingById(building.buildingId);
    return buildingDef?.icon || this.buildingsService.getBuildingById('constructor')?.icon!;
  }

  /**
   * Get the label/name for a placed building
   */
  labelFor(building: PlacedBuilding): string {
    const buildingDef = this.buildingsService.getBuildingById(building.buildingId);
    return buildingDef?.name || building.buildingId;
  }

  /**
   * Get all production buildings (factory definitions)
   */
  getProductionBuildings(): BuildingDefinition[] {
    return this.buildingsService.getBuildingsByCategory('production')
      .sort((a, b) => a.tier - b.tier);
  }


  /**
   * Get factory image URL (placeholder for now)
   */
  getFactoryImageUrl(factoryId: string): string {
    // Using a placeholder image service - you can replace this with actual images later
    return `https://placehold.co/300x200/4a5568/ffffff?text=${encodeURIComponent(factoryId)}`;
  }
}

