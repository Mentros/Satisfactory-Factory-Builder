import { Component, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PlannerService, PlacedBuilding } from '../shared/services/planner.service';
import { BuildingsService } from '../shared/services/buildings.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sp-factories',
  imports: [FontAwesomeModule, TagModule, CommonModule],
  templateUrl: './factories.component.html'
})
export class FactoriesComponent {
  private readonly platformId = inject(PLATFORM_ID);
  
  protected readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private readonly planner: PlannerService,
    private readonly buildingsService: BuildingsService
  ) {}

  factories(): PlacedBuilding[] {
    return this.planner.placed().filter(b => {
      const building = this.buildingsService.getBuildingById(b.buildingId);
      return building?.category === 'production';
    });
  }

  factoriesCount(): number {
    return this.factories().length;
  }

  iconFor(building: PlacedBuilding): IconDefinition {
    const buildingDef = this.buildingsService.getBuildingById(building.buildingId);
    return buildingDef?.icon || this.buildingsService.getBuildingById('constructor')?.icon!;
  }

  labelFor(building: PlacedBuilding): string {
    const buildingDef = this.buildingsService.getBuildingById(building.buildingId);
    return buildingDef?.name || building.buildingId;
  }
}


