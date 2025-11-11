import { Component, EventEmitter, Output, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faIndustry } from '@fortawesome/free-solid-svg-icons';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { MachinesService } from '../../shared/services/machines.service';

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

  readonly items = computed(() => {
    const machines = Array.from(this.machinesService.machinesCache().values());
    return machines.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.category.localeCompare(b.category);
    });
  });

  constructor(private readonly machinesService: MachinesService) {}

  onDragStart(ev: DragEvent, buildingId: string): void {
    ev.dataTransfer?.setData('application/x-satisplan-building', buildingId);
    ev.dataTransfer?.setData('text/plain', buildingId);
    ev.dataTransfer?.setDragImage(new Image(), 0, 0);
    this.startDrag.emit(buildingId);
  }
}


