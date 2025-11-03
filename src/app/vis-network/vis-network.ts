import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Network, Edge, Node, Options } from 'vis-network/peer/esm/vis-network.js';
import { DataSet } from 'vis-data/peer/esm/vis-data.js';

@Component({
  selector: 'app-vis-network',
  imports: [],
  templateUrl: './vis-network.html',
  styleUrl: './vis-network.css',
})
export class VisNetwork implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;
  private network?: Network;

  ngAfterViewInit() {
    const nodes = new DataSet<Node>([
      { id: 'ore', label: 'Iron Ore', shape: 'dot', title: '<b>OUT:</b> 720/min – Iron Ore' },
      { id: 'smelter', label: 'Smelter ×24', shape: 'box',
        title: '24× Smelter at <b>100%</b><br>Needed power: 96 MW<br><b>IN:</b> 720/min – Ore<br><b>OUT:</b> 720/min – Ingot' },
      { id: 'ingot', label: 'Iron Ingot', shape: 'dot', title: '<b>Product</b>' }
    ]);

    const edges = new DataSet<Edge>([
      { from: 'ore', to: 'smelter', arrows: 'to' },
      { from: 'smelter', to: 'ingot', arrows: 'to' }
    ]);

    const options: Options = {
      interaction: { hover: true, tooltipDelay: 120 },
      physics: { solver: 'forceAtlas2Based', stabilization: { iterations: 250 } }
    };

    this.network = new Network(this.container.nativeElement, { nodes, edges }, options);
  }

  ngOnDestroy() { this.network?.destroy(); }

}
