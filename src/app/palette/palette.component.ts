import { Component, EventEmitter, Output, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faIndustry } from '@fortawesome/free-solid-svg-icons';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { BuildingsService } from '../shared/services/buildings.service';
import { BuildingDefinition } from '../shared/models/building.model';

@Component({
  selector: 'sp-palette',
  imports: [FontAwesomeModule, TagModule, ButtonModule, DividerModule, CommonModule],
  templateUrl: './palette.component.html',
  styleUrl: './palette.component.css'
})
export class PaletteComponent {
  @Output() startDrag = new EventEmitter<string>();
  private readonly platformId = inject(PLATFORM_ID);
  
  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly faIndustry = faIndustry;

  protected readonly items: BuildingDefinition[];

  constructor(private readonly buildingsService: BuildingsService) {
    // Get all buildings, sorted by tier then category
    this.items = this.buildingsService.getAllBuildings()
      .sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return a.category.localeCompare(b.category);
      });
  }

  onDragStart(ev: DragEvent, buildingId: string): void {
    ev.dataTransfer?.setData('application/x-satisplan-building', buildingId);
    ev.dataTransfer?.setData('text/plain', buildingId);
    ev.dataTransfer?.setDragImage(new Image(), 0, 0);
    this.startDrag.emit(buildingId);
  }
}


