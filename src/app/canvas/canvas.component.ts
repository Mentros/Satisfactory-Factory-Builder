import { Component, ElementRef, Input, OnInit, PLATFORM_ID, inject, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { PlannerService, PlacedBuilding } from '../shared/services/planner.service';
import { BuildingsService } from '../shared/services/buildings.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'sp-planner-canvas',
  imports: [FontAwesomeModule, ButtonModule, CommonModule],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLDivElement>;
  @Input() tile = 32;

  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected draggingExisting: PlacedBuilding | null = null;

  constructor(
    private readonly planner: PlannerService,
    private readonly buildingsService: BuildingsService
  ) {}

  get buildings(): PlacedBuilding[] {
    return this.planner.placed();
  }

  get canvasHeight(): string {
    const minHeight = 800; // Minimum scrollable height
    if (this.buildings.length === 0) {
      return `${minHeight}px`;
    }
    const minY = Math.min(...this.buildings.map(b => b.y));
    const maxY = Math.max(...this.buildings.map(b => b.y + this.tile));
    const height = maxY - minY + 400; // Add padding
    return `${Math.max(minHeight, height)}px`;
  }

  get canvasWidth(): string {
    const minWidth = 1200; // Minimum scrollable width
    if (this.buildings.length === 0) {
      return `${minWidth}px`;
    }
    const minX = Math.min(...this.buildings.map(b => b.x));
    const maxX = Math.max(...this.buildings.map(b => b.x + this.tile));
    const width = maxX - minX + 400; // Add padding
    return `${Math.max(minWidth, width)}px`;
  }

  ngOnInit(): void {}

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
  }

  onDrop(ev: DragEvent): void {
    if (!isPlatformBrowser(this.platformId) || !this.canvasRef) {
      return;
    }
    ev.preventDefault();
    const buildingId = ev.dataTransfer?.getData('application/x-satisplan-building') || ev.dataTransfer?.getData('text/plain');
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const rawX = (ev.clientX - rect.left) - this.tile / 2;
    const rawY = (ev.clientY - rect.top) - this.tile / 2;
    const x = this.snap(rawX);
    const y = this.snap(rawY);

    if (this.draggingExisting) {
      this.planner.move(this.draggingExisting.id, x, y);
      this.draggingExisting = null;
    } else if (buildingId) {
      this.planner.add(buildingId, x, y);
    }
  }

  onItemDragStart(ev: DragEvent, b: PlacedBuilding): void {
    this.draggingExisting = b;
    ev.dataTransfer?.setData('text/plain', b.buildingId);
    ev.stopPropagation();
  }

  onItemDragEnd(_ev: DragEvent, _b: PlacedBuilding): void {
    // handled on canvas drop
  }

  clear(): void {
    this.planner.clear();
  }

  iconFor(building: PlacedBuilding): IconDefinition {
    const buildingDef = this.buildingsService.getBuildingById(building.buildingId);
    return buildingDef?.icon || this.buildingsService.getBuildingById('constructor')?.icon!;
  }

  private snap(value: number): number {
    return Math.round(value / this.tile) * this.tile;
  }
}


