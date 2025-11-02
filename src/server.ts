import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { getDatabase } from './server/db/init';
import { seedDatabase } from './server/db/seed';
import { MachinesService } from './server/services/machines.service';
import { RecipesService } from './server/services/recipes.service';
import { BuildRequirementsService } from './server/services/build-requirements.service';
import { PlannerService } from './server/services/planner.service';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Middleware
app.use(express.json());

// Lazy service initialization - only create services when actually needed (not during route extraction)
let machinesService: MachinesService | null = null;
let recipesService: RecipesService | null = null;
let buildRequirementsService: BuildRequirementsService | null = null;
let plannerService: PlannerService | null = null;
let servicesInitialized = false;

function initializeServices(): void {
  if (servicesInitialized) {
    return;
  }
  
  // Skip initialization during prerendering/build phase
  // Check if we're in a context where database operations are allowed
  if (typeof process === 'undefined' || !process.env || !process.cwd) {
    // Silently fail during prerendering - services will be initialized when server actually runs
    return;
  }
  
  // Verify database is accessible (it should already be initialized at server start)
  try {
    const db = getDatabase();
    // Just verify we can access it - don't re-initialize or re-seed
    db.prepare('SELECT 1').get();
  } catch (error) {
    // If database isn't accessible, log and return
    console.error('Database is not accessible when initializing services:', error);
    return;
  }
  
  // Create all services together
  try {
    machinesService = new MachinesService();
    recipesService = new RecipesService();
    buildRequirementsService = new BuildRequirementsService();
    plannerService = new PlannerService();
    servicesInitialized = true;
  } catch (error) {
    console.error('Failed to create services:', error);
    throw error;
  }
}

// API Routes

// Machines endpoints
app.get('/api/machines', (req, res) => {
  try {
    initializeServices();
    if (!machinesService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const machines = machinesService.getAllMachines();
    return res.json(machines);
  } catch (error) {
    console.error('Error fetching machines:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/machines/:id', (req, res) => {
  try {
    initializeServices();
    if (!machinesService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const machine = machinesService.getMachineById(req.params.id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    return res.json(machine);
  } catch (error) {
    console.error('Error fetching machine:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/machines/category/:category', (req, res) => {
  try {
    initializeServices();
    if (!machinesService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const machines = machinesService.getMachinesByCategory(req.params.category as any);
    return res.json(machines);
  } catch (error) {
    console.error('Error fetching machines by category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/machines/search/:query', (req, res) => {
  try {
    initializeServices();
    if (!machinesService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const machines = machinesService.searchMachines(req.params.query);
    return res.json(machines);
  } catch (error) {
    console.error('Error searching machines:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Recipes endpoints (factoryId is actually machineId)
app.get('/api/recipes/:factoryId', (req, res) => {
  try {
    initializeServices();
    if (!recipesService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const recipes = recipesService.getRecipesByFactory(req.params.factoryId);
    return res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Build requirements endpoints (factoryId is actually machineId)
app.get('/api/build-requirements/:factoryId', (req, res) => {
  try {
    initializeServices();
    if (!buildRequirementsService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const requirements = buildRequirementsService.getBuildRequirementsByFactory(req.params.factoryId);
    return res.json(requirements);
  } catch (error) {
    console.error('Error fetching build requirements:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Planner endpoints
app.get('/api/planner', (req, res) => {
  try {
    initializeServices();
    if (!plannerService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const placedBuildings = plannerService.getAll();
    return res.json(placedBuildings);
  } catch (error) {
    console.error('Error fetching placed buildings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/planner', (req, res) => {
  try {
    initializeServices();
    if (!plannerService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const { buildingId, x, y } = req.body;
    if (!buildingId || typeof x !== 'number' || typeof y !== 'number') {
      return res.status(400).json({ error: 'Invalid request body. Required: buildingId, x, y' });
    }
    const placedBuilding = plannerService.add(buildingId, x, y);
    return res.status(201).json(placedBuilding);
  } catch (error) {
    console.error('Error adding placed building:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/planner/:id', (req, res) => {
  try {
    initializeServices();
    if (!plannerService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const { id } = req.params;
    const { x, y } = req.body;
    if (typeof x !== 'number' || typeof y !== 'number') {
      return res.status(400).json({ error: 'Invalid request body. Required: x, y' });
    }
    plannerService.update(id, x, y);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating placed building:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/planner/:id', (req, res) => {
  try {
    initializeServices();
    if (!plannerService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    const { id } = req.params;
    plannerService.remove(id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error removing placed building:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/planner', (req, res) => {
  try {
    initializeServices();
    if (!plannerService) {
      return res.status(503).json({ error: 'Service not available' });
    }
    plannerService.clear();
    return res.json({ success: true });
  } catch (error) {
    console.error('Error clearing placed buildings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if ((isMainModule(import.meta.url) || process.env['pm_id']) && typeof process !== 'undefined' && process.env) {
  // Initialize database when server actually starts (not during route extraction/prerendering)
  try {
    const db = getDatabase();
    const buildingCount = db.prepare('SELECT COUNT(*) as count FROM buildings').get() as { count: number };
    if (buildingCount.count === 0) {
      console.log('Database is empty, seeding...');
      seedDatabase();
      console.log('Database seeded successfully');
    }
    // Pre-initialize services when server starts
    console.log('Initializing services...');
    initializeServices();
    if (servicesInitialized) {
      console.log('Services initialized successfully');
    } else {
      console.warn('Warning: Services were not initialized');
    }
  } catch (error) {
    console.error('Failed to initialize database or services:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
  
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
