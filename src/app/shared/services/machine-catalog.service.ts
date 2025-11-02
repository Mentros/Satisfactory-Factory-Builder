import { Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { PlannerService, PlacedBuilding } from './planner.service';
import { MachinesService } from './machines.service';
import { MachineDefinition } from '../models/machine.model';
import { FactoryRecipe } from '../models/recipe.model';
import { BuildRequirement } from '../models/build-requirement.model';

@Injectable({ providedIn: 'root' })
export class MachineCatalogService {
  // Reactive signals for httpResource params
  readonly buildRequirementsMachineId = signal<string | null>(null);
  readonly recipesMachineId = signal<string | null>(null);

  // httpResource for build requirements
  readonly buildRequirementsResource = httpResource<BuildRequirement[]>(() => {
    const machineId = this.buildRequirementsMachineId();
    if (!machineId) return undefined;
    return `/api/build-requirements/${machineId}`;
  });

  // httpResource for recipes
  readonly recipesResource = httpResource<FactoryRecipe[]>(() => {
    const machineId = this.recipesMachineId();
    if (!machineId) return undefined;
    return `/api/recipes/${machineId}`;
  });

  /**
   * Set the machine ID to fetch build requirements for
   */
  loadBuildRequirements(machineId: string): void {
    this.buildRequirementsMachineId.set(machineId);
  }

  /**
   * Set the machine ID to fetch recipes for
   */
  loadRecipes(machineId: string): void {
    this.recipesMachineId.set(machineId);
  }

  constructor(
    private readonly planner: PlannerService,
    private readonly machinesService: MachinesService
  ) {}

  /**
   * Get all placed machines (production machines)
   */
  machines(): PlacedBuilding[] {
    return this.planner.placed().filter(b => {
      const machine = this.machinesService.getMachineById(b.buildingId);
      return machine?.category === 'production';
    });
  }

  /**
   * Get the count of placed machines
   */
  machinesCount(): number {
    return this.machines().length;
  }

  /**
   * Get the icon for a placed machine
   */
  iconFor(machine: PlacedBuilding): IconDefinition {
    const machineDef = this.machinesService.getMachineById(machine.buildingId);
    return machineDef?.icon || this.machinesService.getMachineById('constructor')?.icon!;
  }

  /**
   * Get the label/name for a placed machine
   */
  labelFor(machine: PlacedBuilding): string {
    const machineDef = this.machinesService.getMachineById(machine.buildingId);
    return machineDef?.name || machine.buildingId;
  }

  /**
   * Get all production machines (machine definitions)
   */
  getProductionMachines(): MachineDefinition[] {
    return this.machinesService.getMachinesByCategory('production')
      .sort((a, b) => a.tier - b.tier);
  }

  /**
   * Get machine image URL (placeholder for now)
   */
  getMachineImageUrl(machineId: string): string {
    // Using a placeholder image service - you can replace this with actual images later
    return `https://placehold.co/300x200/4a5568/ffffff?text=${encodeURIComponent(machineId)}`;
  }
}

