import { Injectable, PLATFORM_ID, inject, signal, effect } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface PlacedBuilding {
  id: string;
  buildingId: string; // Reference to building definition ID
  x: number; // px
  y: number; // px
}

@Injectable({ providedIn: 'root' })
export class PlannerService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  readonly placed = signal<PlacedBuilding[]>([]);
  private loadPromise: Promise<void> | null = null;

  // Trigger signals for mutations
  private readonly addTrigger = signal<{buildingId: string, x: number, y: number} | null>(null);
  private readonly moveTrigger = signal<{id: string, x: number, y: number} | null>(null);
  private readonly removeTrigger = signal<string | null>(null);
  private readonly clearTrigger = signal<boolean>(false);

  // httpResource for mutations
  readonly addResource = httpResource(() => {
    const trigger = this.addTrigger();
    if (!trigger) return undefined;
    return {
      url: '/api/planner',
      method: 'POST',
      body: trigger
    };
  });

  readonly moveResource = httpResource(() => {
    const trigger = this.moveTrigger();
    if (!trigger) return undefined;
    return {
      url: `/api/planner/${trigger.id}`,
      method: 'PUT',
      body: { x: trigger.x, y: trigger.y }
    };
  });

  readonly removeResource = httpResource(() => {
    const id = this.removeTrigger();
    if (!id) return undefined;
    return {
      url: `/api/planner/${id}`,
      method: 'DELETE'
    };
  });

  readonly clearResource = httpResource(() => {
    if (!this.clearTrigger()) return undefined;
    return {
      url: '/api/planner',
      method: 'DELETE'
    };
  });

  constructor() {
    this.load();
    // Update placed signal when mutations succeed
    effect(() => {
      const trigger = this.addTrigger();
      const value = this.addResource.value();
      const error = this.addResource.error();
      const isLoading = this.addResource.isLoading();
      
      // Only process when we have a trigger, a successful response, and the request is complete
      if (trigger && value && !error && !isLoading) {
        const newBuilding = value as PlacedBuilding;
        const current = this.placed();
        // Check if building already exists to prevent duplicates
        if (!current.some(b => b.id === newBuilding.id)) {
          const updated = [...current, newBuilding];
          this.placed.set(updated);
        }
        // Reset trigger after processing - use microtask to prevent re-triggering
        // Check that trigger still matches (to avoid resetting if a new one was set)
        const triggerId = `${trigger.buildingId}-${trigger.x}-${trigger.y}`;
        queueMicrotask(() => {
          const current = this.addTrigger();
          if (current && `${current.buildingId}-${current.x}-${current.y}` === triggerId) {
            this.addTrigger.set(null);
          }
        });
      }
    });

    effect(() => {
      const trigger = this.moveTrigger();
      const isLoading = this.moveResource.isLoading();
      const error = this.moveResource.error();
      // Only update after request has completed (was loading, now not loading, no error)
      // Check that trigger exists and request is not currently loading
      if (trigger && !isLoading && error === null) {
        // Only update if this isn't the initial state (indicated by trigger being set)
        // The resource will have processed the request by now
        const current = this.placed();
        const buildingExists = current.some(b => b.id === trigger.id);
        if (buildingExists) {
          const updated = current.map(b => 
            b.id === trigger.id ? { ...b, x: trigger.x, y: trigger.y } : b
          );
          this.placed.set(updated);
        }
        // Reset trigger after processing - use microtask to prevent re-triggering
        // Check that trigger still matches (to avoid resetting if a new one was set)
        const triggerId = trigger.id;
        queueMicrotask(() => {
          const current = this.moveTrigger();
          if (current && current.id === triggerId) {
            this.moveTrigger.set(null);
          }
        });
      }
    });

    effect(() => {
      const id = this.removeTrigger();
      const isLoading = this.removeResource.isLoading();
      const error = this.removeResource.error();
      // Only update after request has completed (was loading, now not loading, no error)
      if (id && !isLoading && error === null) {
        const current = this.placed();
        const updated = current.filter(b => b.id !== id);
        // Only update if something actually changed
        if (updated.length !== current.length) {
          this.placed.set(updated);
        }
        // Reset trigger after processing - use microtask to prevent re-triggering
        queueMicrotask(() => {
          if (this.removeTrigger() === id) {
            this.removeTrigger.set(null);
          }
        });
      }
    });

    effect(() => {
      const shouldClear = this.clearTrigger();
      const value = this.clearResource.value();
      const isLoading = this.clearResource.isLoading();
      const error = this.clearResource.error();
      // Only update after request has completed with a successful response
      if (shouldClear && value && !error && !isLoading) {
        const current = this.placed();
        if (current.length > 0) {
          this.placed.set([]);
        }
        // Reset trigger after processing - use microtask to prevent re-triggering
        queueMicrotask(() => {
          if (this.clearTrigger()) {
            this.clearTrigger.set(false);
          }
        });
      }
    });
  }

  private async load(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      try {
        const buildings = await firstValueFrom(
          this.http.get<PlacedBuilding[]>('/api/planner')
        );
        this.placed.set(buildings);
      } catch (error) {
        console.error('Failed to load placed buildings:', error);
        this.placed.set([]);
      }
    })();

    return this.loadPromise;
  }

  add(buildingId: string, x: number, y: number): void {
    this.addTrigger.set({ buildingId, x, y });
  }

  move(id: string, x: number, y: number): void {
    this.moveTrigger.set({ id, x, y });
  }

  remove(id: string): void {
    this.removeTrigger.set(id);
  }

  clear(): void {
    this.clearTrigger.set(true);
  }
}


