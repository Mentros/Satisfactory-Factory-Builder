import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MachineCatalogComponent } from './machine-catalog.component';
import { MachineCatalogService } from '../shared/services/machine-catalog.service';
import { MachineDefinition } from '../shared/models/machine.model';
import { BuildRequirement } from '../shared/models/build-requirement.model';
import { FactoryRecipe } from '../shared/models/recipe.model';

describe('MachineCatalogComponent', () => {
  let component: MachineCatalogComponent;
  let fixture: any;
  let mockMachineCatalogService: jasmine.SpyObj<MachineCatalogService>;
  let mockBuildRequirementsResource: any;
  let mockRecipesResource: any;

  const mockMachine: MachineDefinition = {
    id: 'constructor',
    name: 'Constructor',
    description: 'A basic production machine',
    category: 'production',
    icon: {} as any,
    tier: 1,
    powerConsumption: 4
  };

  const mockMachines: MachineDefinition[] = [
    mockMachine,
    {
      id: 'assembler',
      name: 'Assembler',
      description: 'An advanced production machine',
      category: 'production',
      icon: {} as any,
      tier: 2,
      powerConsumption: 15
    }
  ];

  const mockBuildRequirements: BuildRequirement[] = [
    { item: 'Iron Plate', amount: 10 },
    { item: 'Copper Wire', amount: 5 }
  ];

  const mockRecipes: FactoryRecipe[] = [
    {
      id: 'recipe-1',
      name: 'Iron Plate Recipe',
      duration: 6,
      inputs: [{ item: 'Iron Ingot', amount: 30 }],
      outputs: [{ item: 'Iron Plate', amount: 20 }]
    }
  ];

  beforeEach(async () => {
    // Create mock resource signals
    const buildRequirementsValue = signal<BuildRequirement[]>([]);
    const recipesValue = signal<FactoryRecipe[]>([]);
    const isLoadingBuild = signal(false);
    const isLoadingRecipes = signal(false);

    mockBuildRequirementsResource = {
      value: buildRequirementsValue,
      isLoading: () => isLoadingBuild()
    };

    mockRecipesResource = {
      value: recipesValue,
      isLoading: () => isLoadingRecipes()
    };

    // Create spy object for MachineCatalogService
    mockMachineCatalogService = jasmine.createSpyObj(
      'MachineCatalogService',
      ['getProductionMachines', 'loadBuildRequirements', 'loadRecipes'],
      {
        buildRequirementsMachineId: signal<string | null>(null),
        recipesMachineId: signal<string | null>(null),
        buildRequirementsResource: mockBuildRequirementsResource,
        recipesResource: mockRecipesResource
      }
    );

    mockMachineCatalogService.getProductionMachines.and.returnValue(mockMachines);

    await TestBed.configureTestingModule({
      imports: [MachineCatalogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MachineCatalogService, useValue: mockMachineCatalogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MachineCatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load machines from service on initialization', () => {
    expect(mockMachineCatalogService.getProductionMachines).toHaveBeenCalled();
    expect(component.machines).toEqual(mockMachines);
  });

  it('should initialize with no selected machine', () => {
    expect(component.selectedMachine()).toBeNull();
  });

  it('should select a machine and trigger resource loading', () => {
    component.selectMachine(mockMachine);

    expect(component.selectedMachine()).toEqual(mockMachine);
    expect(mockMachineCatalogService.loadBuildRequirements).toHaveBeenCalledWith(mockMachine.id);
    expect(mockMachineCatalogService.loadRecipes).toHaveBeenCalledWith(mockMachine.id);
  });

  it('should return empty array for selectedMachineRequirements when no machine is selected', () => {
    component.selectedMachine.set(null);
    expect(component.selectedMachineRequirements()).toEqual([]);
  });

  it('should return empty array for selectedMachineRequirements when machine ID does not match', () => {
    component.selectedMachine.set(mockMachine);
    mockMachineCatalogService.buildRequirementsMachineId.set('different-machine');
    mockBuildRequirementsResource.value.set(mockBuildRequirements);

    expect(component.selectedMachineRequirements()).toEqual([]);
  });

  it('should return build requirements when machine is selected and ID matches', () => {
    component.selectedMachine.set(mockMachine);
    mockMachineCatalogService.buildRequirementsMachineId.set(mockMachine.id);
    mockBuildRequirementsResource.value.set(mockBuildRequirements);

    expect(component.selectedMachineRequirements()).toEqual(mockBuildRequirements);
  });

  it('should return empty array for selectedMachineRecipes when no machine is selected', () => {
    component.selectedMachine.set(null);
    expect(component.selectedMachineRecipes()).toEqual([]);
  });

  it('should return empty array for selectedMachineRecipes when machine ID does not match', () => {
    component.selectedMachine.set(mockMachine);
    mockMachineCatalogService.recipesMachineId.set('different-machine');
    mockRecipesResource.value.set(mockRecipes);

    expect(component.selectedMachineRecipes()).toEqual([]);
  });

  it('should return recipes when machine is selected and ID matches', () => {
    component.selectedMachine.set(mockMachine);
    mockMachineCatalogService.recipesMachineId.set(mockMachine.id);
    mockRecipesResource.value.set(mockRecipes);

    expect(component.selectedMachineRecipes()).toEqual(mockRecipes);
  });

  it('should return 0 for getRecipes', () => {
    expect(component.getRecipes('any-machine-id')).toBe(0);
  });

  it('should return correct icon background style for tier 1', () => {
    const style = component.getIconBackgroundStyle(1);
    expect(style).toEqual({
      width: '2.5rem',
      height: '2.5rem',
      background: 'linear-gradient(to bottom, #22d3ee, #0891b2)'
    });
  });

  it('should return correct icon background style for tier 2', () => {
    const style = component.getIconBackgroundStyle(2);
    expect(style).toEqual({
      width: '2.5rem',
      height: '2.5rem',
      background: 'linear-gradient(to bottom, #fb923c, #ea580c)'
    });
  });

  it('should return default tier 1 style for unknown tier', () => {
    const style = component.getIconBackgroundStyle(99);
    expect(style).toEqual({
      width: '2.5rem',
      height: '2.5rem',
      background: 'linear-gradient(to bottom, #22d3ee, #0891b2)'
    });
  });

  it('should handle array conversion for build requirements', () => {
    component.selectedMachine.set(mockMachine);
    mockMachineCatalogService.buildRequirementsMachineId.set(mockMachine.id);
    // Simulate non-array value being set
    mockBuildRequirementsResource.value.set(null as any);
    expect(component.selectedMachineRequirements()).toEqual([]);
  });

  it('should handle array conversion for recipes', () => {
    component.selectedMachine.set(mockMachine);
    mockMachineCatalogService.recipesMachineId.set(mockMachine.id);
    // Simulate non-array value being set
    mockRecipesResource.value.set(null as any);
    expect(component.selectedMachineRecipes()).toEqual([]);
  });
});
