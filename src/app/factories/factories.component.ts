import { Component, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PlannerService, PlacedBuilding, BuildingType } from '../shared/services/planner.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faIndustry, faCogs } from '@fortawesome/free-solid-svg-icons';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sp-factories',
  imports: [FontAwesomeModule, TagModule, CommonModule],
  templateUrl: './factories.component.html'
})
export class FactoriesComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly factoryTypes: BuildingType[] = ['smelter', 'constructor', 'assembler'];
  
  protected readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor(private readonly planner: PlannerService) {}

  factories(): PlacedBuilding[] {
    return this.planner.placed().filter(b => this.factoryTypes.includes(b.type));
  }

  factoriesCount(): number {
    return this.factories().length;
  }

  iconFor(type: BuildingType) {
    switch (type) {
      case 'smelter':
      case 'constructor':
      case 'assembler':
        return faCogs;
      default:
        return faIndustry;
    }
  }

  labelFor(type: BuildingType): string {
    switch (type) {
      case 'smelter': return 'Smelter';
      case 'constructor': return 'Constructor';
      case 'assembler': return 'Assembler';
      default: return type;
    }
  }
}


