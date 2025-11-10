import { AfterViewInit, Component, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Network, Edge, Node, Options } from 'vis-network/peer/esm/vis-network.js';
import { DataSet } from 'vis-data/peer/esm/vis-data.js';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MachineDefinition } from '../shared/models/machine.model';

@Component({
  selector: 'sp-vis-network',
  imports: [ButtonModule, CommonModule],
  templateUrl: './vis-network.html',
  styleUrl: './vis-network.css',
})
export class VisNetwork implements AfterViewInit, OnDestroy {
  private network?: Network;
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  private hostElement = inject(ElementRef);
  protected edgeSignal: WritableSignal<DataSet<Edge>> = signal(new DataSet<Edge>());
  protected nodesSignal: WritableSignal<DataSet<Node>> = signal(new DataSet<Node>());
  protected isNetworkReady: WritableSignal<boolean> = signal(false);
  protected options: Options = {
    physics: false,
    interaction: {
      hover: true,
      tooltipDelay: 120,
      dragNodes: true,      // allow dragging (for bend points)
    },
    edges: {
      smooth: false,        // straight lines only
      arrows: 'to',         // default arrows
      arrowStrikethrough: false,
      width: 3
    }
  };

  protected setTestData() {
    this.nodesSignal.update(nodes => {
      nodes.add([
        { id: 'copper', label: 'Copper Ore', shape: 'dot', title: '<b>OUT:</b> 720/min – Iron Ore', x: 0, y: 0 },
        { id: 'ore', label: 'Iron Ore', shape: 'dot', title: '<b>OUT:</b> 720/min – Iron Ore', x: 0, y: 0 },
        {
          id: 'smelter', label: 'Smelter ×24', shape: 'box',
          title: '24× Smelter at <b>100%</b><br>Needed power: 96 MW<br><b>IN:</b> 720/min – Ore<br><b>OUT:</b> 720/min – Ingot',
          x: 200, y: 0
        },
        { id: 'ingot', label: 'Iron Ingot', shape: 'dot', title: '<b>Product</b>', x: 400, y: 200 },
      ]);
      return nodes;
    });

    this.edgeSignal.update(edges => {
      edges.add([
        { from: 'ore', to: 'smelter', arrows: 'to', smooth: false, width: 3, color: '#60a5fa' },
        { from: 'smelter', to: 'bend1', smooth: false, width: 3, color: '#60a5fa' },
        { from: 'bend1', to: 'ingot', arrows: 'to', smooth: false, width: 3, color: '#60a5fa' },
      ]);
      return edges;
    });
  }

  private edgeSource: string | number | null = null;


  ngAfterViewInit() {
    if (!this.isBrowser) {
      return;
    }

    setTimeout(() => {
      const containerElement = this.hostElement.nativeElement.querySelector('.vis-network') as HTMLDivElement;
      if (!containerElement) {
        return;
      }

      //this.setTestData();
      this.network = new Network(containerElement, { nodes: this.nodesSignal(), edges: this.edgeSignal() }, this.options);

      const GRID = 20; // px grid size
      const snap = (v: number) => Math.round(v / GRID) * GRID;

      const isLocked = (id: string | number) => {
        const n = this.nodesSignal().get(id as any) as any;
        const f = n?.fixed;
        return !!(f && (f === true || f.x || f.y));
      };

      this.network.on('dragEnd', (params: any) => {
        if (!params?.nodes?.length) return;
        const updates: { id: string | number, x: number, y: number }[] = [];
        const positions = this.network!.getPositions(params.nodes);
        for (const id of params.nodes) {
          if (isLocked(id)) continue;              // don't move bend1
          const p = positions[id];
          updates.push({ id, x: snap(p.x), y: snap(p.y) });
        }

        if (updates.length) {
          this.nodesSignal.update(nodes => {
            nodes.update(updates);
            return nodes;
          });
        }
      });

      this.addClickEventListener();

      this.isNetworkReady.set(true);
    }, 200);
  }


  addNode() {
    if (!this.network) {
      return;
    }

    const nodeId = `newNode_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const nodeCount = this.nodesSignal().length;

    const newNode: Node = {
      id: nodeId,
      label: `New Node ${nodeCount + 1}`,
      shape: 'dot',
      title: `<b>New Node</b>`,
      size: 20,
      color: {
        background: '#60a5fa',
        border: '#3b82f6',
        highlight: {
          background: '#93c5fd',
          border: '#3b82f6'
        }
      }
    };

    this.nodesSignal.update(nodes => {
      nodes.add(newNode);
      return nodes;
    });
  }

  addMachineNode(machine: MachineDefinition, screenX: number, screenY: number) {
    if (!this.network) {
      return;
    }

    const { roundedX, roundedY } = { roundedX: Math.round(screenX / 20) * 20, roundedY: Math.round(screenY / 20) * 20 };

    // Create node for the machine
    const newNode: Node = {
      id: this.nodesSignal().length + 1,
      label: machine.name,
      shape: 'box',
      title: `${machine.name} | ${machine.description || ''}`,
      x: roundedX,
      y: roundedY,
      size: 30,
      color: {
        background: '#fa9549',
        border: '#d8751f',
        highlight: {
          background: '#ffa562',
          border: '#fa9549'
        }
      },
      font: {
        color: '#ffffff',
        size: 14
      }
    };

    console.log('newNode', newNode);

    this.nodesSignal.update(nodes => {
      nodes.add(newNode);
      return nodes;
    });
  }

  private addClickEventListener() {
    if (!this.network) return;

    this.network.on('click', (params: any) => {
      //console.log('click', params.pointer.canvas);
      const nodeId = params.nodes?.[0];
      if (!nodeId) return;

      if (!this.edgeSource) {
        this.edgeSource = nodeId;
        this.network!.selectNodes([nodeId]); // highlight start
      } else {
        const from = this.edgeSource, to = nodeId;
        this.edgeSource = null;
        this.network!.unselectAll();

        // choose straight OR right-angle:
        //this.addStraightEdge(from, to);
        this.addRightAngleEdge(from, to); // 90° turn
      }
    });

    // optional: right-click anywhere cancels
    this.network.on('oncontext', () => {
      this.edgeSource = null;
      this.network!.unselectAll();
    });
  }

  private addStraightEdge(from: string | number, to: string | number) {
    // prevent self-loop / duplicates
    if (from === to) return;
    const exists = this.edgeSignal().get({
      filter: e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    }).length > 0;
    if (exists) return;

    this.edgeSignal.update(edges => {
      edges.add({ from, to, arrows: 'to', smooth: false, width: 3 });
      return edges;
    });
  }

  private addRightAngleEdge(from: string | number, to: string | number) {
    const pos = this.network!.getPositions([String(from), String(to)]);
    const A = pos[String(from)], B = pos[String(to)];
    const bendId = 'bend_' + Math.random().toString(36).slice(2, 9);
    const { roundedX, roundedY } = { roundedX: Math.round(B.x / 20) * 20, roundedY: Math.round(A.y / 20) * 20 };

    this.nodesSignal.update(nodes => {
      nodes.add({
        id: bendId, x: roundedX, y: roundedY, fixed: { x: true, y: true },
        shape: 'dot', size: 0.1
      });
      return nodes;
    });
    this.edgeSignal.update(edges => {
      edges.add([
        { from, to: bendId, smooth: false, width: 3, arrows: { to: { enabled: false } } },
        { from: bendId, to, smooth: false, width: 3, arrows: { to: { enabled: false } } },
      ]);
      return edges;
    });
  }



  ngOnDestroy() {
    //this.network?.destroy();
  }

}
