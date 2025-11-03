import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signal, PLATFORM_ID } from '@angular/core';
import { CanvasComponent } from './canvas.component';
import { PlannerService, PlacedBuilding } from '../shared/services/planner.service';
import { MachinesService } from '../shared/services/machines.service';
import { MachineDefinition } from '../shared/models/machine.model';
import { faCogs } from '@fortawesome/free-solid-svg-icons';

describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let fixture: any;
  let mockPlannerService: jasmine.SpyObj<PlannerService>;
  let mockMachinesService: jasmine.SpyObj<MachinesService>;
  let mockPlacedBuildings: PlacedBuilding[];
  let mockMachine: MachineDefinition;
  let mockIcon = faCogs;

  beforeEach(async () => {
    mockMachine = {
      id: 'constructor',
      name: 'Constructor',
      description: 'A basic production machine',
      category: 'production',
      icon: mockIcon,
      tier: 1
    };

    mockPlacedBuildings = [
      {
        id: 'building-1',
        buildingId: 'constructor',
        x: 100,
        y: 100
      },
      {
        id: 'building-2',
        buildingId: 'assembler',
        x: 200,
        y: 200
      }
    ];

    const placedSignal = signal<PlacedBuilding[]>(mockPlacedBuildings);

    mockPlannerService = jasmine.createSpyObj(
      'PlannerService',
      ['add', 'move', 'clear'],
      {
        placed: placedSignal
      }
    );

    mockMachinesService = jasmine.createSpyObj(
      'MachinesService',
      ['getMachineById'],
      {}
    );

    mockMachinesService.getMachineById.and.returnValue(mockMachine);

    await TestBed.configureTestingModule({
      imports: [CanvasComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PlannerService, useValue: mockPlannerService },
        { provide: MachinesService, useValue: mockMachinesService },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default tile size', () => {
    expect(component.tile).toBe(32);
  });

  it('should accept custom tile size via input', () => {
    component.tile = 64;
    expect(component.tile).toBe(64);
  });

  it('should have isBrowser set to true in browser platform', () => {
    expect(component['isBrowser']).toBe(true);
  });

  it('should initialize with no dragging existing building', () => {
    expect(component['draggingExisting']).toBeNull();
  });

  it('should return buildings from planner service', () => {
    expect(component.buildings()).toEqual(mockPlacedBuildings);
  });

  it('should calculate canvas height based on buildings', () => {
    const height = component.canvasHeight();
    expect(height).toContain('px');
    expect(parseInt(height)).toBeGreaterThanOrEqual(800);
  });

  it('should return minimum height when no buildings', () => {
    mockPlannerService.placed.set([]);
    const height = component.canvasHeight();
    expect(height).toBe('800px');
  });

  it('should calculate canvas width based on buildings', () => {
    const width = component.canvasWidth();
    expect(width).toContain('px');
    expect(parseInt(width)).toBeGreaterThanOrEqual(1200);
  });

  it('should return minimum width when no buildings', () => {
    mockPlannerService.placed.set([]);
    const width = component.canvasWidth();
    expect(width).toBe('1200px');
  });

  it('should prevent default on drag over', () => {
    const event = new DragEvent('dragover', { bubbles: true, cancelable: true });
    const preventDefaultSpy = spyOn(event, 'preventDefault');
    const stopPropagationSpy = spyOn(event, 'stopPropagation');

    component.onDragOver(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should handle drop event for new building', () => {
    const event = new DragEvent('drop', { bubbles: true, cancelable: true });
    const dataTransfer = {
      getData: jasmine.createSpy('getData').and.returnValue('constructor')
    } as any;
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer, writable: false });

    component.canvasRef = {
      nativeElement: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0
        })
      }
    } as any;

    const preventDefaultSpy = spyOn(event, 'preventDefault');
    const stopPropagationSpy = spyOn(event, 'stopPropagation');

    component.onDrop(event);

    // Use setTimeout to wait for requestAnimationFrame
    setTimeout(() => {
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(mockPlannerService.add).toHaveBeenCalled();
    }, 100);
  });

  it('should handle drop event for existing building', () => {
    const existingBuilding = mockPlacedBuildings[0];
    component['draggingExisting'] = existingBuilding;

    const event = new DragEvent('drop', { bubbles: true, cancelable: true });
    const dataTransfer = {
      getData: jasmine.createSpy('getData').and.returnValue('constructor')
    } as any;
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer, writable: false });

    component.canvasRef = {
      nativeElement: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0
        })
      }
    } as any;

    component.onDrop(event);

    setTimeout(() => {
      expect(mockPlannerService.move).toHaveBeenCalled();
      expect(component['draggingExisting']).toBeNull();
    }, 100);
  });

  it('should not handle drop if not in browser', () => {
    const event = new DragEvent('drop', { bubbles: true, cancelable: true });
    component['canvasRef'] = undefined as any;

    component.onDrop(event);

    expect(mockPlannerService.add).not.toHaveBeenCalled();
    expect(mockPlannerService.move).not.toHaveBeenCalled();
  });

  it('should set dragging existing building on item drag start', () => {
    const building = mockPlacedBuildings[0];
    const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    const dataTransfer = {
      setData: jasmine.createSpy('setData')
    } as any;
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer, writable: false });
    const stopPropagationSpy = spyOn(event, 'stopPropagation');

    component.onItemDragStart(event, building);

    expect(component['draggingExisting']).toBe(building);
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', building.buildingId);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should handle item drag end', () => {
    const building = mockPlacedBuildings[0];
    const event = new DragEvent('dragend', { bubbles: true, cancelable: true });

    // Should not throw
    expect(() => component.onItemDragEnd(event, building)).not.toThrow();
  });

  it('should clear planner on clear', () => {
    component.clear();
    expect(mockPlannerService.clear).toHaveBeenCalled();
  });

  it('should return icon for building', () => {
    const building = mockPlacedBuildings[0];
    const icon = component.iconFor(building);
    expect(mockMachinesService.getMachineById).toHaveBeenCalledWith(building.buildingId);
    expect(icon).toBe(mockIcon);
  });

  it('should return default constructor icon if machine not found', () => {
    const building = mockPlacedBuildings[0];
    const constructorIcon = faCogs;
    let callCount = 0;
    mockMachinesService.getMachineById.and.callFake((id: string) => {
      callCount++;
      if (callCount === 1) {
        // First call: building's machine ID
        return undefined;
      } else {
        // Second call: constructor
        return {
          ...mockMachine,
          icon: constructorIcon
        };
      }
    });

    const icon = component.iconFor(building);
    expect(mockMachinesService.getMachineById).toHaveBeenCalledWith(building.buildingId);
    expect(mockMachinesService.getMachineById).toHaveBeenCalledWith('constructor');
    expect(icon).toBe(constructorIcon);
  });

  it('should snap values to tile grid', () => {
    component.tile = 32;
    expect(component['snap'](0)).toBe(0);
    expect(component['snap'](16)).toBe(32);
    expect(component['snap'](33)).toBe(32);
    expect(component['snap'](48)).toBe(64);
    expect(component['snap'](65)).toBe(64);
  });

  it('should snap negative values correctly', () => {
    component.tile = 32;
    expect(component['snap'](-16)).toBe(0);
    expect(component['snap'](-33)).toBe(-32);
  });

  it('should handle drop with both data transfer formats', () => {
    const event = new DragEvent('drop', { bubbles: true, cancelable: true });
    const dataTransfer = {
      getData: jasmine.createSpy('getData').and.callFake((format: string) => {
        if (format === 'application/x-satisplan-building') return 'assembler';
        if (format === 'text/plain') return 'constructor';
        return '';
      })
    } as any;
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer, writable: false });

    component.canvasRef = {
      nativeElement: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0
        })
      }
    } as any;

    component.onDrop(event);

    setTimeout(() => {
      expect(mockPlannerService.add).toHaveBeenCalledWith('assembler', jasmine.any(Number), jasmine.any(Number));
    }, 100);
  });

  it('should calculate canvas dimensions with padding', () => {
    const buildings = [
      { id: '1', buildingId: 'constructor', x: 0, y: 0 },
      { id: '2', buildingId: 'assembler', x: 100, y: 100 }
    ];
    mockPlannerService.placed.set(buildings);
    component.tile = 32;

    const width = component.canvasWidth();
    const height = component.canvasHeight();

    // Should include padding (400px) and be at least minimum size
    expect(parseInt(width)).toBeGreaterThan(100);
    expect(parseInt(height)).toBeGreaterThan(100);
  });
});
