import { Component, ViewChild } from '@angular/core';
import { Carousel, CarouselModule, CarouselPassThrough } from 'primeng/carousel';
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
  @ViewChild('visNetwork') visNetwork!: VisNetwork;
  machines: MachineDefinition[] = [];

  protected readonly responsiveOptions = [
    {
      breakpoint: '2560px',
      numVisible: 6,
      numScroll: 3
    },
    {
      breakpoint: '1680px',
      numVisible: 4,
      numScroll: 3
    },
    {
      breakpoint: '1400px',
      numVisible: 3,
      numScroll: 3
    },
    {
      breakpoint: '1199px',
      numVisible: 2,
      numScroll: 2
    }
  ]

  carouselPT: CarouselPassThrough<Carousel> = {
    pcNextButton: {
      root: {
        class: 'hover:bg-orange-300 bg-orange-100  text-purple-500'
      }
    },
    pcPrevButton: {
      root: {
        class: 'hover:bg-orange-300 bg-orange-100 text-purple-500'
      }
    }
  }

  constructor(private machinesService: MachinesService) { }

  ngOnInit() {
    this.machines = this.machinesService.getProductionMachines();
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


  onDragStart($event: DragEvent, machineId: string) {
    if ($event.dataTransfer) {
      $event.dataTransfer.setData('application/x-satisplan-machine', machineId);
      $event.dataTransfer.setData('text/plain', machineId);
      $event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onDragOver($event: DragEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    if ($event.dataTransfer) {
      $event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDrop($event: DragEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    
    const machineId = $event.dataTransfer?.getData('application/x-satisplan-machine') || 
                      $event.dataTransfer?.getData('text/plain');
    
    if (machineId && this.visNetwork) {
      // Get the machine definition
      const machine = this.machines.find(m => m.id === machineId);
      if (machine) {
        // Get coordinates relative to the drop target
        const dropTarget = $event.currentTarget as HTMLElement;
        const visNetworkElement = dropTarget.querySelector('.vis-network') as HTMLElement;
        if (visNetworkElement) {
          const rect = visNetworkElement.getBoundingClientRect();
          
          const x = $event.clientX - rect.left - (rect.width / 2);
          const y = $event.clientY - rect.top - (rect.height / 2);

          // Add the machine node to the network
          this.visNetwork.addMachineNode(machine, x, y);
        }
      }
    }
  }

  getMachineImageSrc(machineName: string): string {
    return `/assets/machines/${machineName}.webp`;
  }

  getIngredientImageSrc(ingredientName: string): string {
    return `/assets/ingredients/${ingredientName.split(' ').join('_')}.png`;
  }
}
