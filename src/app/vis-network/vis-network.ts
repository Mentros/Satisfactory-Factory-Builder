import { AfterViewInit, Component, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Network, Edge, Node, Options, IdType } from 'vis-network/peer/esm/vis-network.js';
import { DataSet } from 'vis-data/peer/esm/vis-data.js';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MachineDefinition } from '../shared/models/machine.model';
import { environment } from '../../environments/environment';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'sp-vis-network',
  imports: [ButtonModule, CommonModule, ContextMenuModule],
  templateUrl: './vis-network.html',
  styleUrl: './vis-network.css',
})
export class VisNetwork implements AfterViewInit, OnDestroy {
  private network?: Network;

  private hostElement = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly isBrowser = isPlatformBrowser(this.platformId);

  protected items: MenuItem[] = [
    {
      label: 'Remove Machine', icon: 'pi pi-server', command: () => {
        if (!this.contextNode) return;
        this.removeMachineNode(this.contextNode!);
      }
    },
    {
      label: 'Remove Edge', icon: 'pi pi-share-alt', command: () => {
        if (!this.contextNode) return;
        this.removeEdge(this.contextNode!.id!);
      }
    },
    {
      label: 'Clean Canvas', icon: 'pi pi-refresh', command: () => {
        this.cleanCanvas();
      }
    }
  ];
  protected contextNode: Node | null = null;

  private readonly getNextNodeId = (() => {
    let counter = 0;
    return () => ++counter;
  })();

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

  private edgeSource: string | number | null = null;

  // Track bend point relationships: bendId -> { from, to }
  private bendPointMap = new Map<string | number, { from: string | number, to: string | number }>();


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
      this.addContextMenuEventListener();

      this.addDragEndEventListener();

      this.addClickEventListener();

      this.isNetworkReady.set(true);
    }, 200);
  }

  addMachineNode(machine: MachineDefinition, screenX: number, screenY: number) {
    if (!this.network) {
      return;
    }

    // Round to the nearest grid size
    const { roundedX, roundedY } = { roundedX: Math.round(screenX / environment.gridSize) * environment.gridSize, roundedY: Math.round(screenY / environment.gridSize) * environment.gridSize };

    // Create node for the machine
    const newNode: Node = {
      id: this.getNextNodeId(),
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

    this.nodesSignal.update(nodes => {
      nodes.add(newNode);
      return nodes;
    });
  }

  private removeMachineNode(node: Node) {
    const nodeId = node.id!;

    this.removeEdge(nodeId);

    // Finally, remove the machine node itself
    this.nodesSignal.update(nodes => {
      nodes.remove(nodeId);
      return nodes;
    });
  }

  private removeEdge(nodeId: IdType) {
    // Find all bend points connected to this node
    const bendPointsToRemove: (string | number)[] = [];
    for (const [bendId, { from, to }] of this.bendPointMap.entries()) {
      if (from === nodeId || to === nodeId) {
        bendPointsToRemove.push(bendId);
      }
    }

    // Remove edges connected to the machine node
    this.edgeSignal.update(edges => {
      const edgesToRemove = edges.get({
        filter: (e: Edge) => e.from === nodeId || e.to === nodeId
      }).map((e: Edge) => e.id || `${e.from}-${e.to}`);
      edges.remove(edgesToRemove);
      return edges;
    });

    // Remove edges connected to bend points and remove bend point nodes
    if (bendPointsToRemove.length > 0) {
      this.edgeSignal.update(edges => {
        const bendEdgesToRemove: (string | number)[] = [];
        for (const bendId of bendPointsToRemove) {
          const connectedEdges = edges.get({
            filter: (e: Edge) => e.from === bendId || e.to === bendId
          });
          bendEdgesToRemove.push(...connectedEdges.map((e: Edge) => e.id || `${e.from}-${e.to}`));
        }
        edges.remove(bendEdgesToRemove);
        return edges;
      });

      this.nodesSignal.update(nodes => {
        nodes.remove(bendPointsToRemove);
        return nodes;
      });

      // Remove from bendPointMap
      for (const bendId of bendPointsToRemove) {
        this.bendPointMap.delete(bendId);
      }
    }
  }

  //#region Event Listeners
  private addDragEndEventListener() {
    if (!this.network) return;

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
      const movedNodeIds: (string | number)[] = [];

      for (const id of params.nodes) {
        if (isLocked(id)) continue;              // don't move bend points manually
        const p = positions[id];
        updates.push({ id, x: snap(p.x), y: snap(p.y) });
        movedNodeIds.push(id);
      }

      if (updates.length) {
        this.nodesSignal.update(nodes => {
          nodes.update(updates);
          return nodes;
        });

        // Recalculate bend points after updating node positions
        // Use setTimeout to ensure network has updated positions
        setTimeout(() => {
          this.recalculateBendPoints(movedNodeIds);
        }, 0);
      }
    });
  }

  private addClickEventListener() {
    if (!this.network) return;

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

  private addContextMenuEventListener() {
    if (!this.network) return;

    this.network.on('oncontext', (params: any) => {
      const gridSize = environment.gridSize;
      const searchRadius = gridSize * 2;
      const px = params.pointer.canvas.x;
      const py = params.pointer.canvas.y;

      const node = this.nodesSignal().get({
        filter: n => {
          // Allow for a square region with side length 2*searchRadius, center at pointer
          return (
            Math.abs(n.x! - px) <= searchRadius &&
            Math.abs(n.y! - py) <= searchRadius
          );
        }
      })[0];

      if (node)
        this.contextNode = node;
    });
  }
  //#endregion

  //#region Edges
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

    // Store the relationship
    this.bendPointMap.set(bendId, { from, to });

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
  //#endregion

  private recalculateBendPoints(movedNodeIds: (string | number)[]) {
    const GRID = environment.gridSize;
    const snap = (v: number) => Math.round(v / GRID) * GRID;

    // Find all bend points connected to moved nodes
    const bendPointsToUpdate = new Map<string | number, { from: string | number, to: string | number }>();

    for (const [bendId, { from, to }] of this.bendPointMap.entries()) {
      if (movedNodeIds.includes(from) || movedNodeIds.includes(to)) {
        bendPointsToUpdate.set(bendId, { from, to });
      }
    }

    if (bendPointsToUpdate.size === 0) return;

    // Get current positions of all relevant nodes
    const allNodeIds = new Set<string | number>();
    for (const { from, to } of bendPointsToUpdate.values()) {
      allNodeIds.add(String(from));
      allNodeIds.add(String(to));
    }
    const positions = this.network!.getPositions(Array.from(allNodeIds));

    // Calculate new bend point positions
    const bendUpdates: { id: string | number, x: number, y: number }[] = [];

    for (const [bendId, { from, to }] of bendPointsToUpdate.entries()) {
      const A = positions[String(from)];
      const B = positions[String(to)];

      if (A && B) {
        // Right-angle: use B's x and A's y
        const roundedX = snap(B.x);
        const roundedY = snap(A.y);
        bendUpdates.push({ id: bendId, x: roundedX, y: roundedY });
      }
    }

    // Update bend point positions in signal
    if (bendUpdates.length > 0) {
      this.nodesSignal.update(nodes => {
        nodes.update(bendUpdates);
        return nodes;
      });
    }
  }

  private cleanCanvas() {
    this.nodesSignal.update(nodes => {
      nodes.clear();
      return nodes;
    });
    this.edgeSignal.update(edges => {
      edges.clear();
      return edges;
    });
  }

  ngOnDestroy() {
    //this.network?.destroy();
  }

}
