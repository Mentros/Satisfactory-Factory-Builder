import { Component } from '@angular/core';
import { CanvasComponent } from '../canvas/canvas.component';
import { PaletteComponent } from '../palette/palette.component';

@Component({
  selector: 'sp-planner-page',
  imports: [CanvasComponent, PaletteComponent],
  templateUrl: './planner.page.html',
  styleUrl: './planner.page.css'
})
export class PlannerPageComponent {}


