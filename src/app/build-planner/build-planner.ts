import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { MachineCategory, MachineDefinition } from '../shared/models/machine.model';
import { MachinesService } from '../shared/services/machines.service';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { VisNetwork } from '../vis-network/vis-network';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-build-planner',
  imports: [CarouselModule, TagModule, CommonModule, VisNetwork, CardModule],
  templateUrl: './build-planner.html',
  styleUrl: './build-planner.css',
})
export class BuildPlanner {
  machines: MachineDefinition[] = [];

  responsiveOptions: any[] | undefined;

  constructor(private machinesService: MachinesService) { }

  ngOnInit() {
    this.machines = this.machinesService.getProductionMachines();

    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
      }
    ]
  }

  getSeverity(category: MachineCategory) {
    switch (category) {
      case MachineCategory.production:
        return 'success';
      case MachineCategory.logistics:
        return 'info';
      case MachineCategory.power:
        return 'warn';
      case MachineCategory.storage:
        return 'danger';
      case MachineCategory.extraction:
        return 'secondary';
      case MachineCategory.special:
        return 'contrast';
      default:
        return 'danger';
    }
  }

  getImageSrc(machineName: string): string {
    return `/assets/machines/${machineName}.webp`;
  }
}
