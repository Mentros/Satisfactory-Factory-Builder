import { Component, EventEmitter, Output, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faIndustry, faCogs, faBolt, faCubes } from '@fortawesome/free-solid-svg-icons';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';

interface PaletteItem {
  key: string;
  label: string;
  icon: any;
}

@Component({
  selector: 'sp-building-palette',
  imports: [FontAwesomeModule, TagModule, ButtonModule, CardModule, DividerModule, CommonModule],
  templateUrl: './palette.component.html'
})
export class PaletteComponent {
  @Output() startDrag = new EventEmitter<string>();
  private readonly platformId = inject(PLATFORM_ID);
  
  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly faIndustry = faIndustry;

  protected readonly items: PaletteItem[] = [
    { key: 'miner', label: 'Miner', icon: faIndustry },
    { key: 'smelter', label: 'Smelter', icon: faCogs },
    { key: 'constructor', label: 'Constructor', icon: faCogs },
    { key: 'storage', label: 'Storage', icon: faCubes },
    { key: 'power', label: 'Power', icon: faBolt }
  ];

  onDragStart(ev: DragEvent, type: string): void {
    ev.dataTransfer?.setData('application/x-satisplan-building', type);
    ev.dataTransfer?.setData('text/plain', type);
    ev.dataTransfer?.setDragImage(new Image(), 0, 0);
    this.startDrag.emit(type);
  }
}


