import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { MachineDefinition, MachineCategory } from '../models/machine.model';
import { getIconByName } from '../utils/icon-mapper';
import { firstValueFrom } from 'rxjs';
import { PlannerService, PlacedBuilding } from './planner.service';
import { FactoryRecipe } from '../models/recipe.model';
import { BuildRequirement } from '../models/build-requirement.model';

interface MachineApiResponse {
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
  buildRequirements?: BuildRequirement[];
}

@Injectable({ providedIn: 'root' })
export class MachinesService {
  readonly machinesCache = signal<Map<string, MachineDefinition>>(new Map());
  private readonly http = inject(HttpClient);
  private loadPromise: Promise<void> | null = null;

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

  constructor(
    private readonly planner: PlannerService
  ) {
    this.loadMachines();
  }

  private async loadMachines(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      try {
        const response = await firstValueFrom(
          this.http.get<MachineApiResponse[]>('/api/machines')
        );
        const machines = response.map(this.mapApiResponseToMachine);
        this.machinesCache.set(new Map(machines.map(m => [m.id, m])));
      } catch (error) {
        console.error('Failed to load machines:', error);
        // Fallback to empty map on error
        this.machinesCache.set(new Map());
      }
    })();

    return this.loadPromise;
  }

  private mapApiResponseToMachine(apiMachine: MachineApiResponse): MachineDefinition {
    return {
      id: apiMachine.id,
      name: apiMachine.name,
      description: apiMachine.description,
      category: apiMachine.category,
      icon: getIconByName(apiMachine.iconName),
      tier: apiMachine.tier,
      ...(apiMachine.powerConsumption !== undefined && { powerConsumption: apiMachine.powerConsumption }),
      ...(apiMachine.powerProduction !== undefined && { powerProduction: apiMachine.powerProduction }),
      ...(apiMachine.dimensions && { dimensions: apiMachine.dimensions }),
      ...(apiMachine.maxConveyorBeltConnections !== undefined && { maxConveyorBeltConnections: apiMachine.maxConveyorBeltConnections }),
      ...(apiMachine.maxPipeConnections !== undefined && { maxPipeConnections: apiMachine.maxPipeConnections }),
      ...(apiMachine.recipes && { recipes: apiMachine.recipes }),
      ...(apiMachine.buildRequirements && { buildRequirements: apiMachine.buildRequirements }),
    };
  }

  getAllMachines(): MachineDefinition[] {
    return Array.from(this.machinesCache().values());
  }

  getMachineById(id: string): MachineDefinition | undefined {
    return this.machinesCache().get(id);
  }

  getMachinesByCategory(category: MachineCategory): MachineDefinition[] {
    return this.getAllMachines().filter(m => m.category === category);
  }

  getMachinesByTier(maxTier: number): MachineDefinition[] {
    return this.getAllMachines().filter(m => m.tier <= maxTier);
  }

  searchMachines(query: string): MachineDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllMachines().filter(m => 
      m.name.toLowerCase().includes(lowerQuery) ||
      m.description.toLowerCase().includes(lowerQuery) ||
      m.id.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Set the machine ID to fetch build requirements for
   */
  loadBuildRequirements(machineId: string): void {
    this.buildRequirementsMachineId.set(machineId);
  }

  /**
   * Get build requirements for a machine directly from the API
   * Returns a Promise that resolves with the build requirements
   */
  async getBuildRequirements(machineId: string): Promise<BuildRequirement[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<BuildRequirement[]>(`/api/build-requirements/${machineId}`)
      );
      return response;
    } catch (error) {
      console.error(`Failed to load build requirements for ${machineId}:`, error);
      return [];
    }
  }

  /**
   * Set the machine ID to fetch recipes for
   */
  loadRecipes(machineId: string): void {
    this.recipesMachineId.set(machineId);
  }

  /**
   * Get all placed machines (production machines)
   */
  getPlacedProductionMachines(): PlacedBuilding[] {
    return this.planner.placed().filter(b => {
      const machine = this.getMachineById(b.buildingId);
      return machine?.category === 'production';
    });
  }

  /**
   * Get the count of placed production machines
   */
  getPlacedProductionMachinesCount(): number {
    return this.getPlacedProductionMachines().length;
  }

  /**
   * Get the icon for a placed machine
   */
  getIconForPlacedMachine(machine: PlacedBuilding): IconDefinition {
    const machineDef = this.getMachineById(machine.buildingId);
    return machineDef?.icon || this.getMachineById('constructor')?.icon!;
  }

  /**
   * Get the label/name for a placed machine
   */
  getLabelForPlacedMachine(machine: PlacedBuilding): string {
    const machineDef = this.getMachineById(machine.buildingId);
    return machineDef?.name || machine.buildingId;
  }

  /**
   * Get all production machines (machine definitions) sorted by tier
   */
  getProductionMachines(): MachineDefinition[] {
    return this.getMachinesByCategory(MachineCategory.production)
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

