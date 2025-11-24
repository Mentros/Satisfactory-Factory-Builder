import { Component, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faIndustry, faCogs, faBolt, faCubes } from '@fortawesome/free-solid-svg-icons';
import { menuItems } from './shared/config/menu.config';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App{
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly menuItems = menuItems;
  protected drawerExpanded = signal(false);

  constructor(library: FaIconLibrary) {
    library.addIcons(faIndustry, faCogs, faBolt, faCubes);
  }

  toggleDrawer(): void {
    this.drawerExpanded.set(!this.drawerExpanded());
  }
}
