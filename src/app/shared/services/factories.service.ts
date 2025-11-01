import { Injectable } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { PlannerService, PlacedBuilding } from './planner.service';
import { BuildingsService } from './buildings.service';
import { BuildingDefinition } from '../models/building.model';
import { FactoryRecipe } from '../models/recipe.model';
import { BuildRequirement } from '../models/build-requirement.model';
import { factoryBuildRequirementsTestData } from '../testdata/factory-build-requirements.testdata';
import { factoryRecipesTestData } from '../testdata/factory-recipes.testdata';

@Injectable({ providedIn: 'root' })
export class FactoriesService {
  // Test data - will be replaced with database data later
  private readonly buildRequirements = factoryBuildRequirementsTestData;
  private readonly factoryRecipes = factoryRecipesTestData;

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
   * Get build requirements for a factory
   */
  getBuildRequirements(factoryId: string): BuildRequirement[] {
    return this.buildRequirements[factoryId] || [];
  }

  /**
   * Get recipes for a factory
   */
  getRecipes(factoryId: string): FactoryRecipe[] {
    return this.factoryRecipes[factoryId] || [];
  }

  /**
   * Get factory image URL (placeholder for now)
   */
  getFactoryImageUrl(factoryId: string): string {
    // Using a placeholder image service - you can replace this with actual images later
    return `https://placehold.co/300x200/4a5568/ffffff?text=${encodeURIComponent(factoryId)}`;
  }
}

