import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type BuildingType = 'miner' | 'smelter' | 'constructor' | 'assembler' | 'storage' | 'power';

export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  x: number; // px
  y: number; // px
}

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'satisplan.layout.v1';
  readonly placed = signal<PlacedBuilding[]>(this.load());

  add(type: BuildingType, x: number, y: number): void {
    const id = `${type}-${crypto.randomUUID()}`;
    const updated = [...this.placed(), { id, type, x, y }];
    this.placed.set(updated);
    this.persist();
  }

  move(id: string, x: number, y: number): void {
    const updated = this.placed().map(b => (b.id === id ? { ...b, x, y } : b));
    this.placed.set(updated);
    this.persist();
  }

  remove(id: string): void {
    const updated = this.placed().filter(b => b.id !== id);
    this.placed.set(updated);
    this.persist();
  }

  clear(): void {
    this.placed.set([]);
    this.persist();
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.placed()));
    } catch {
      // ignore
    }
  }

  private load(): PlacedBuilding[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as PlacedBuilding[]) : [];
    } catch {
      return [];
    }
  }
}


