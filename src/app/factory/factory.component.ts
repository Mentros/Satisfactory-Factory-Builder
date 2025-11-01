import { Component } from '@angular/core';
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
  selectedFactory: BuildingDefinition | null = null;

  constructor(private readonly factoriesService: FactoriesService) {
    // Get all production buildings
    this.factories = this.factoriesService.getProductionBuildings();
  }

  getBuildRequirements(factoryId: string) {
    return this.factoriesService.getBuildRequirements(factoryId);
  }

  getRecipes(factoryId: string) {
    return this.factoriesService.getRecipes(factoryId);
  }

  selectFactory(factory: BuildingDefinition) {
    this.selectedFactory = factory;
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

