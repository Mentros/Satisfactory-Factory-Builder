import { Component, ElementRef, Input, OnInit, PLATFORM_ID, inject, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { PlannerService, PlacedBuilding, BuildingType } from '../shared/services/planner.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faIndustry, faCogs, faBolt, faCubes } from '@fortawesome/free-solid-svg-icons';
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

  constructor(private readonly planner: PlannerService) {}

  get buildings(): PlacedBuilding[] {
    return this.planner.placed();
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
    const type = (ev.dataTransfer?.getData('application/x-satisplan-building') || ev.dataTransfer?.getData('text/plain')) as BuildingType;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const rawX = (ev.clientX - rect.left) - this.tile / 2;
    const rawY = (ev.clientY - rect.top) - this.tile / 2;
    const x = this.snap(rawX);
    const y = this.snap(rawY);

    if (this.draggingExisting) {
      this.planner.move(this.draggingExisting.id, x, y);
      this.draggingExisting = null;
    } else if (type) {
      this.planner.add(type, x, y);
    }
  }

  onItemDragStart(ev: DragEvent, b: PlacedBuilding): void {
    this.draggingExisting = b;
    ev.dataTransfer?.setData('text/plain', b.type);
    ev.stopPropagation();
  }

  onItemDragEnd(_ev: DragEvent, _b: PlacedBuilding): void {
    // handled on canvas drop
  }

  clear(): void {
    this.planner.clear();
  }

  iconFor(type: BuildingType) {
    switch (type) {
      case 'miner': return faIndustry;
      case 'smelter': return faCogs;
      case 'constructor': return faCogs;
      case 'storage': return faCubes;
      case 'power': return faBolt;
      default: return faCogs;
    }
  }

  private snap(value: number): number {
    return Math.round(value / this.tile) * this.tile;
  }
}


