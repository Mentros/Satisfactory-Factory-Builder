import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { BuildRequirement } from './build-requirement.model';

export enum MachineCategory {
  production = 'production',
  logistics = 'logistics',
  power = 'power',
  storage = 'storage',
  extraction = 'extraction',
  special = 'special'
}

export interface ConnectionPoint {
  id: string;
  type: 'conveyor' | 'pipe' | 'power' | 'data';
  position: 'north' | 'south' | 'east' | 'west' | 'top' | 'bottom';
  relativeX: number; // Relative to machine center (0-1)
  relativeY: number;
  maxConnections?: number;
}

export interface Machine {
  id: string;
  name: string;
  description: string;
  category: MachineCategory;
  icon: IconDefinition;
  tier: number; // Research tier/availability
  powerConsumption?: number; // MW
  powerProduction?: number; // MW
  dimensions?: {
    width: number; // in tiles
    height: number; // in tiles
  };
}

export interface MachineDefinition extends Machine {
  recipes?: string[]; // Recipe IDs this machine can use
  maxConveyorBeltConnections?: number;
  maxPipeConnections?: number;
  buildRequirements?: BuildRequirement[]; // Ingredients needed to build this machine
  connectionPoints?: {
    inputs: ConnectionPoint[];
    outputs: ConnectionPoint[];
  };
}

