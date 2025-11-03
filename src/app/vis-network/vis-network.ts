import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Network, Edge, Node, Options } from 'vis-network/peer/esm/vis-network.js';
import { DataSet } from 'vis-data/peer/esm/vis-data.js';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-vis-network',
  imports: [ButtonModule, CommonModule],
  templateUrl: './vis-network.html',
  styleUrl: './vis-network.css',
})
export class VisNetwork implements AfterViewInit, OnDestroy {
  private network?: Network;
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  private hostElement = inject(ElementRef);
  protected nodes = new DataSet<Node>();
  protected edges = new DataSet<Edge>();
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
    this.nodes.add([
      { id: 'copper', label: 'Copper Ore', shape: 'dot', title: '<b>OUT:</b> 720/min – Iron Ore', x: 0, y: 0 },
      { id: 'ore', label: 'Iron Ore', shape: 'dot', title: '<b>OUT:</b> 720/min – Iron Ore', x: 0, y: 0 },
      {
        id: 'smelter', label: 'Smelter ×24', shape: 'box',
        title: '24× Smelter at <b>100%</b><br>Needed power: 96 MW<br><b>IN:</b> 720/min – Ore<br><b>OUT:</b> 720/min – Ingot',
        x: 200, y: 0
      },
      { id: 'ingot', label: 'Iron Ingot', shape: 'dot', title: '<b>Product</b>', x: 400, y: 200 },

      // Bend point: NOT draggable
      {
        id: 'bend1', x: 200, y: 200, fixed: { x: true, y: true }, shape: 'dot', size: 0.1,
        color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' }
      }
    ]);

    // -- EDGES (90° via bend1)
    this.edges.add([
      { from: 'ore', to: 'smelter', arrows: 'to', smooth: false, width: 3, color: '#60a5fa' },
      { from: 'smelter', to: 'bend1', smooth: false, width: 3, color: '#60a5fa' },
      { from: 'bend1', to: 'ingot', arrows: 'to', smooth: false, width: 3, color: '#60a5fa' },
    ]);
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
      this.network = new Network(containerElement, { nodes: this.nodes, edges: this.edges }, this.options);

      const GRID = 20; // px grid size
      const snap = (v: number) => Math.round(v / GRID) * GRID;

      const isLocked = (id: string | number) => {
        const n = this.nodes.get(id as any) as any;
        const f = n?.fixed;
        return !!(f && (f === true || f.x || f.y));
      };

      this.network.on('dragEnd', (params: any) => {
        if (!params?.nodes?.length) return;
        const updates = [];
        const positions = this.network!.getPositions(params.nodes);
        for (const id of params.nodes) {
          if (isLocked(id)) continue;              // don't move bend1
          const p = positions[id];
          updates.push({ id, x: snap(p.x), y: snap(p.y) });
        }
        if (updates.length) this.nodes.update(updates);
      });

      this.setupNodeClick();

      this.isNetworkReady.set(true);
    }, 200);
  }

  
  addNode() {
    if (!this.network) {
      return;
    }
    
    const nodeId = `newNode_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const nodeCount = this.nodes.length;
    
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
    
    this.nodes.add(newNode);
  }

  private setupNodeClick() {
    if (!this.network) return;

    // TODO: Fix this to not connect to random points
    // Its just setting the x variable but not the y variable also that way it stays even if the connected node is moved
    this.network.on('click', (params: any) => {
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
        // this.addStraightEdge(from, to);
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
    const exists = this.edges.get({
      filter: e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    }).length > 0;
    if (exists) return;

    this.edges.add({ from, to, arrows: 'to', smooth: false, width: 3 });
  }

  private addRightAngleEdge(from: string | number, to: string | number) {
    const pos = this.network!.getPositions([String(from), String(to)]);
    const A = pos[String(from)], B = pos[String(to)];
    const bendId = 'bend_' + Math.random().toString(36).slice(2, 9);
    this.nodes.add({
      id: bendId, x: B.x, y: A.y, fixed: { x: true, y: true },
      shape: 'dot', size: 0.1, color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' }
    });
    this.edges.add([
      { from, to: bendId, smooth: false, width: 3 },
      { from: bendId, to, smooth: false, width: 3, arrows: 'to' },
    ]);
  }



  ngOnDestroy() { this.network?.destroy(); }

}
