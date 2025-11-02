export interface ConnectionPathPoint {
  x: number;
  y: number;
  z?: number; // For 3D rendering
  type?: 'straight' | 'corner' | 'vertical' | 'junction';
}

export interface MachineConnection {
  id: string;
  buildId: string;
  factoryId: string;
  floorId: string;
  fromMachineId: string;
  fromPortId: string;
  toMachineId: string;
  toPortId: string;
  connectionType: 'conveyor' | 'pipe' | 'power' | 'data';
  path?: ConnectionPathPoint[];
  status?: 'active' | 'inactive' | 'error';
  createdAt?: string;
}

export interface ConnectionDragState {
  fromMachineId: string;
  fromPortId: string;
  active: boolean;
}

