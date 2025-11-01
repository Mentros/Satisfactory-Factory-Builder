import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfigBase } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
    // Animations are not provided on the server side - PrimeNG components work without them
  ]
};

// Merge base config (without animations) with server config
export const config = mergeApplicationConfig(appConfigBase, serverConfig);
