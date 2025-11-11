import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signal, PLATFORM_ID } from '@angular/core';
import { PaletteComponent } from './palette.component';
import { MachinesService } from '../shared/services/machines.service';
import { MachineDefinition } from '../shared/models/machine.model';
import { faCogs } from '@fortawesome/free-solid-svg-icons';

describe('PaletteComponent', () => {
  let component: PaletteComponent;
  let fixture: any;
  let mockMachinesService: jasmine.SpyObj<MachinesService>;
  let mockMachines: MachineDefinition[];
  let mockIcon = faCogs;

  beforeEach(async () => {

    mockMachines = [
      {
        id: 'constructor',
        name: 'Constructor',
        description: 'A basic production machine',
        category: 'production',
        icon: mockIcon,
        tier: 1
      },
      {
        id: 'assembler',
        name: 'Assembler',
        description: 'An advanced production machine',
        category: 'production',
        icon: mockIcon,
        tier: 2
      },
      {
        id: 'conveyor',
        name: 'Conveyor Belt',
        description: 'A logistics machine',
        category: 'logistics',
        icon: mockIcon,
        tier: 1
      },
      {
        id: 'miner',
        name: 'Miner',
        description: 'An extraction machine',
        category: 'extraction',
        icon: mockIcon,
        tier: 1
      }
    ];

    const machinesCache = new Map<string, MachineDefinition>();
    mockMachines.forEach(m => machinesCache.set(m.id, m));

    const machinesCacheSignal = signal<Map<string, MachineDefinition>>(machinesCache);

    mockMachinesService = jasmine.createSpyObj(
      'MachinesService',
      [],
      {
        machinesCache: machinesCacheSignal
      }
    );

    await TestBed.configureTestingModule({
      imports: [PaletteComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MachinesService, useValue: mockMachinesService },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return sorted machines by tier then category', () => {
    const items = component.items();
    expect(items.length).toBe(4);
    
    // Should be sorted by tier first (all tier 1, then tier 2)
    expect(items[0].tier).toBeLessThanOrEqual(items[1].tier);
    expect(items[1].tier).toBeLessThanOrEqual(items[2].tier);
    
    // Same tier items should be sorted by category
    const tier1Items = items.filter(m => m.tier === 1);
    if (tier1Items.length > 1) {
      expect(tier1Items[0].category.localeCompare(tier1Items[1].category)).toBeLessThanOrEqual(0);
    }
  });

  it('should emit startDrag event on drag start', () => {
    const buildingId = 'constructor';
    const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    const dataTransfer = {
      setData: jasmine.createSpy('setData'),
      setDragImage: jasmine.createSpy('setDragImage')
    } as any;
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer, writable: false });

    spyOn(component.startDrag, 'emit');

    component.onDragStart(event, buildingId);

    expect(dataTransfer.setData).toHaveBeenCalledWith('application/x-satisplan-building', buildingId);
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', buildingId);
    expect(dataTransfer.setDragImage).toHaveBeenCalledWith(jasmine.any(Image), 0, 0);
    expect(component.startDrag.emit).toHaveBeenCalledWith(buildingId);
  });

  it('should handle drag start with null dataTransfer', () => {
    const buildingId = 'constructor';
    const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: null, writable: false });

    spyOn(component.startDrag, 'emit');

    // Should not throw
    expect(() => component.onDragStart(event, buildingId)).not.toThrow();
    expect(component.startDrag.emit).toHaveBeenCalledWith(buildingId);
  });

  it('should update items when machines cache changes', () => {
    const newMachine: MachineDefinition = {
      id: 'smelter',
      name: 'Smelter',
      description: 'A smelting machine',
      category: 'production',
      icon: mockIcon,
      tier: 1
    };

    const newCache = new Map(mockMachinesService.machinesCache());
    newCache.set(newMachine.id, newMachine);
    mockMachinesService.machinesCache.set(newCache);

    const items = component.items();
    expect(items.length).toBe(5);
    expect(items.some(m => m.id === 'smelter')).toBe(true);
  });

  it('should return empty array when machines cache is empty', () => {
    mockMachinesService.machinesCache.set(new Map());
    const items = component.items();
    expect(items.length).toBe(0);
  });

  it('should sort machines correctly with same tier and different categories', () => {
    const sameTierMachines: MachineDefinition[] = [
      {
        id: 'miner',
        name: 'Miner',
        description: 'Extraction',
        category: 'extraction',
        icon: mockIcon,
        tier: 1
      },
      {
        id: 'conveyor',
        name: 'Conveyor',
        description: 'Logistics',
        category: 'logistics',
        icon: mockIcon,
        tier: 1
      },
      {
        id: 'constructor',
        name: 'Constructor',
        description: 'Production',
        category: 'production',
        icon: mockIcon,
        tier: 1
      }
    ];

    const cache = new Map<string, MachineDefinition>();
    sameTierMachines.forEach(m => cache.set(m.id, m));
    mockMachinesService.machinesCache.set(cache);

    const items = component.items();
    expect(items.length).toBe(3);
    // Should be sorted by category alphabetically: extraction, logistics, production
    expect(items[0].category).toBe('extraction');
    expect(items[1].category).toBe('logistics');
    expect(items[2].category).toBe('production');
  });

  it('should prioritize tier sorting over category sorting', () => {
    const mixedTierMachines: MachineDefinition[] = [
      {
        id: 'advanced',
        name: 'Advanced',
        description: 'Tier 2',
        category: 'production',
        icon: mockIcon,
        tier: 2
      },
      {
        id: 'basic',
        name: 'Basic',
        description: 'Tier 1',
        category: 'production',
        icon: mockIcon,
        tier: 1
      }
    ];

    const cache = new Map<string, MachineDefinition>();
    mixedTierMachines.forEach(m => cache.set(m.id, m));
    mockMachinesService.machinesCache.set(cache);

    const items = component.items();
    expect(items[0].tier).toBe(1);
    expect(items[1].tier).toBe(2);
  });
});
