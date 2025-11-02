import { Component, ElementRef, Input, OnInit, PLATFORM_ID, inject, ViewChild, computed } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { PlannerService, PlacedBuilding } from '../shared/services/planner.service';
import { MachinesService } from '../shared/services/machines.service';
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
    private readonly machinesService: MachinesService
  ) {}

  readonly buildings = computed(() => this.planner.placed());

  readonly canvasHeight = computed(() => {
    const buildings = this.buildings();
    const minHeight = 800; // Minimum scrollable height
    if (buildings.length === 0) {
      return `${minHeight}px`;
    }
    const minY = Math.min(...buildings.map(b => b.y));
    const maxY = Math.max(...buildings.map(b => b.y + this.tile));
    const height = maxY - minY + 400; // Add padding
    return `${Math.max(minHeight, height)}px`;
  });

  readonly canvasWidth = computed(() => {
    const buildings = this.buildings();
    const minWidth = 1200; // Minimum scrollable width
    if (buildings.length === 0) {
      return `${minWidth}px`;
    }
    const minX = Math.min(...buildings.map(b => b.x));
    const maxX = Math.max(...buildings.map(b => b.x + this.tile));
    const width = maxX - minX + 400; // Add padding
    return `${Math.max(minWidth, width)}px`;
  });

  ngOnInit(): void {}

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation(); // Prevent event bubbling to avoid unnecessary change detection
  }

  onDrop(ev: DragEvent): void {
    if (!isPlatformBrowser(this.platformId) || !this.canvasRef) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    
    // Extract data from the event before deferring
    const buildingId = ev.dataTransfer?.getData('application/x-satisplan-building') || ev.dataTransfer?.getData('text/plain');
    const clientX = ev.clientX;
    const clientY = ev.clientY;
    const draggingExisting = this.draggingExisting;
    
    // Use requestAnimationFrame to ensure drop handler doesn't block the UI thread
    requestAnimationFrame(() => {
      if (!this.canvasRef) {
        return;
      }
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const rawX = (clientX - rect.left) - this.tile / 2;
      const rawY = (clientY - rect.top) - this.tile / 2;
      const x = this.snap(rawX);
      const y = this.snap(rawY);

      if (draggingExisting) {
        this.planner.move(draggingExisting.id, x, y);
        this.draggingExisting = null;
      } else if (buildingId) {
        this.planner.add(buildingId, x, y);
      }
    });
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
    const machineDef = this.machinesService.getMachineById(building.buildingId);
    return machineDef?.icon || this.machinesService.getMachineById('constructor')?.icon!;
  }

  private snap(value: number): number {
    return Math.round(value / this.tile) * this.tile;
  }
}


