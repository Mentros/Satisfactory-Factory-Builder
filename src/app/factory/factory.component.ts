import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { FactoriesService } from '../shared/services/factories.service';
import { BuildingDefinition } from '../shared/models/building.model';

@Component({
  selector: 'sp-factory',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ButtonModule ],
  templateUrl: './factory.component.html',
  styleUrl: './factory.component.css'
})
export class FactoryComponent {
  factories: BuildingDefinition[] = [];
  selectedFactory = signal<BuildingDefinition | null>(null);

  // Computed signals for selected factory data from resources
  // Only show data if the selected factory matches the resource's factoryId
  selectedFactoryRequirements = computed(() => {
    const factory = this.selectedFactory();
    const loadedFactoryId = this.factoriesService.buildRequirementsFactoryId();
    if (!factory || factory.id !== loadedFactoryId) {
      return [];
    }
    const value = this.factoriesService.buildRequirementsResource.value();
    return Array.isArray(value) ? value : [];
  });

  selectedFactoryRecipes = computed(() => {
    const factory = this.selectedFactory();
    const loadedFactoryId = this.factoriesService.recipesFactoryId();
    if (!factory || factory.id !== loadedFactoryId) {
      return [];
    }
    const value = this.factoriesService.recipesResource.value();
    return Array.isArray(value) ? value : [];
  });

  constructor(public readonly factoriesService: FactoriesService) {
    // Get all production buildings
    this.factories = this.factoriesService.getProductionBuildings();
  }

  // Read-only getter for template use (no signal writes)
  // Used for factory list cards to show recipe counts
  // Note: This will show 0 until recipes are loaded for that factory
  // For a production app, you might want a separate caching mechanism for counts
  getRecipes(factoryId: string): number {
    // Since resources are single-factory, we can't show counts for all factories
    // This is a limitation - for now return 0 or we'd need separate resources
    return 0;
  }

  selectFactory(factory: BuildingDefinition) {
    this.selectedFactory.set(factory);
    // Trigger resource fetches for selected factory
    this.factoriesService.loadBuildRequirements(factory.id);
    this.factoriesService.loadRecipes(factory.id);
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

