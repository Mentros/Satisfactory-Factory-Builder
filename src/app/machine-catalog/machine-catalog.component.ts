import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { MachineCatalogService } from '../shared/services/machine-catalog.service';
import { MachineDefinition } from '../shared/models/machine.model';

@Component({
  selector: 'sp-machine-catalog',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ButtonModule ],
  templateUrl: './machine-catalog.component.html',
  styleUrl: './machine-catalog.component.css'
})
export class MachineCatalogComponent {
  machines: MachineDefinition[] = [];
  selectedMachine = signal<MachineDefinition | null>(null);

  // Computed signals for selected machine data from resources
  // Only show data if the selected machine matches the resource's machineId
  selectedMachineRequirements = computed(() => {
    const machine = this.selectedMachine();
    const loadedMachineId = this.machineCatalogService.buildRequirementsMachineId();
    if (!machine || machine.id !== loadedMachineId) {
      return [];
    }
    const value = this.machineCatalogService.buildRequirementsResource.value();
    return Array.isArray(value) ? value : [];
  });

  selectedMachineRecipes = computed(() => {
    const machine = this.selectedMachine();
    const loadedMachineId = this.machineCatalogService.recipesMachineId();
    if (!machine || machine.id !== loadedMachineId) {
      return [];
    }
    const value = this.machineCatalogService.recipesResource.value();
    return Array.isArray(value) ? value : [];
  });

  constructor(public readonly machineCatalogService: MachineCatalogService) {
    // Get all production machines
    this.machines = this.machineCatalogService.getProductionMachines();
  }

  // Read-only getter for template use (no signal writes)
  // Used for machine list cards to show recipe counts
  // Note: This will show 0 until recipes are loaded for that machine
  // For a production app, you might want a separate caching mechanism for counts
  getRecipes(machineId: string): number {
    // Since resources are single-machine, we can't show counts for all machines
    // This is a limitation - for now return 0 or we'd need separate resources
    return 0;
  }

  selectMachine(machine: MachineDefinition) {
    this.selectedMachine.set(machine);
    // Trigger resource fetches for selected machine
    this.machineCatalogService.loadBuildRequirements(machine.id);
    this.machineCatalogService.loadRecipes(machine.id);
  }

  getIconBackgroundStyle(tier: number): { [key: string]: string } {
    // Different gradient colors based on tier
    const gradients: Record<number, { from: string; to: string }> = {
      1: { from: '#22d3ee', to: '#0891b2' }, // cyan
      2: { from: '#fb923c', to: '#ea580c' }, // orange
      3: { from: '#94a3b8', to: '#64748b' }, // slate
      4: { from: '#a78bfa', to: '#7c3aed' }, // violet
      5: { from: '#34d399', to: '#10b981' }, // emerald
      6: { from: '#fb7185', to: '#e11d48' }, // rose
    };
    
    const colors = gradients[tier] || gradients[1];
    
    return {
      'width': '2.5rem',
      'height': '2.5rem',
      'background': `linear-gradient(to bottom, ${colors.from}, ${colors.to})`
    };
  }
}

