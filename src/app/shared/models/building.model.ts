import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type BuildingCategory = 
  | 'production' 
  | 'logistics' 
  | 'power' 
  | 'storage' 
  | 'extraction'
  | 'special';

export interface Building {
  id: string;
  name: string;
  description: string;
  category: BuildingCategory;
  icon: IconDefinition;
  tier: number; // Research tier/availability
  powerConsumption?: number; // MW
  powerProduction?: number; // MW
  dimensions?: {
    width: number; // in tiles
    height: number; // in tiles
  };
}

export interface BuildingDefinition extends Building {
  recipes?: string[]; // Recipe IDs this building can use
  maxConveyorBeltConnections?: number;
  maxPipeConnections?: number;
}

