import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MachineDefinition, MachineCategory } from '../models/machine.model';
import { getIconByName } from '../utils/icon-mapper';
import { firstValueFrom } from 'rxjs';

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
}

@Injectable({ providedIn: 'root' })
export class MachinesService {
  readonly machinesCache = signal<Map<string, MachineDefinition>>(new Map());
  private readonly http = inject(HttpClient);
  private loadPromise: Promise<void> | null = null;

  constructor() {
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
}

