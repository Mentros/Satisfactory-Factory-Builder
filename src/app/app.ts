import { Component, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faIndustry, faCogs, faBolt, faCubes } from '@fortawesome/free-solid-svg-icons';
import { menuItems } from './shared/config/menu.config';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenubarModule, CardModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App{
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly title = signal('Satisplan');
  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly menuItems = menuItems;

  constructor(library: FaIconLibrary) {
    library.addIcons(faIndustry, faCogs, faBolt, faCubes);
  }
}
