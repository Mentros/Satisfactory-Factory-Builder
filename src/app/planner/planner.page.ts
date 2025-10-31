import { Component } from '@angular/core';
import { CanvasComponent } from '../canvas/canvas.component';
import { PaletteComponent } from '../palette/palette.component';
import { FactoriesComponent } from '../factories/factories.component';

@Component({
  selector: 'sp-planner-page',
  imports: [CanvasComponent, PaletteComponent, FactoriesComponent],
  templateUrl: './planner.page.html',
  styleUrl: './planner.page.css'
})
export class PlannerPageComponent {}


