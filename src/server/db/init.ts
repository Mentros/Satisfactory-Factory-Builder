// Lazy import to avoid loading better-sqlite3 during prerendering
// better-sqlite3 uses __filename internally which causes issues during prerendering
import { createRequire } from 'node:module';

let Database: any = null;
let db: any = null;

function getDirname(): string {
  // Try import.meta.dirname first (Node 20.11+)
  if (typeof import.meta.dirname !== 'undefined') {
    return import.meta.dirname;
  }
  
  // Fallback for older Node versions or during bundling
  if (import.meta.url) {
    const { dirname } = require('node:path');
    const { fileURLToPath } = require('node:url');
    return dirname(fileURLToPath(import.meta.url));
  }
  
  // Last resort fallback
  if (typeof process !== 'undefined' && process.cwd) {
    return process.cwd();
  }
  return '.';
}

function loadDatabaseSync(): any {
  // Only load better-sqlite3 when actually needed (not during prerendering)
  if (typeof process === 'undefined' || !process.env) {
    throw new Error('Database cannot be initialized in this context');
  }
  
  if (!Database) {
    // Use createRequire to dynamically load better-sqlite3
    // This prevents it from being loaded during module evaluation
    try {
      const req = createRequire(import.meta.url);
      Database = req('better-sqlite3');
    } catch (error) {
      throw new Error(`Failed to load database module: ${error}`);
    }
  }
  return Database;
}

function findSchemaPath(): string {
  const { existsSync } = require('node:fs');
  const { join } = require('node:path');
  const currentDir = getDirname();
  
  // Try multiple possible locations
  const possiblePaths = [
    // Environment variable override (highest priority)
    process.env['SCHEMA_PATH'],
    // Relative to current compiled file location
    join(currentDir, 'schema.sql'),
    join(currentDir, 'db/schema.sql'),
    join(currentDir, '../db/schema.sql'),
    join(currentDir, '../../db/schema.sql'),
    // From dist folder (production - various structures)
    join(process.cwd(), 'dist/Satisplan/browser/server/db/schema.sql'),
    join(process.cwd(), 'dist/Satisplan/server/db/schema.sql'),
    join(process.cwd(), 'dist/server/db/schema.sql'),
    // From project root (development)
    join(process.cwd(), 'src/server/db/schema.sql'),
  ].filter(Boolean); // Remove undefined values
  
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  
  throw new Error(`Could not find schema.sql file. Tried: ${possiblePaths.join(', ')}`);
}

export function getDatabase(): any {
  if (db) {
    return db;
  }

  // Don't try to initialize database during prerendering/build phase
  // Only initialize when actually running the server
  if (typeof process === 'undefined' || !process.env) {
    throw new Error('Database cannot be initialized in this context');
  }

  try {
    const DatabaseClass = loadDatabaseSync();
    const { readFileSync } = require('node:fs');
    const { join } = require('node:path');
    
    const currentDir = getDirname();
    
    // Determine database path
    const dbPath = process.env['DATABASE_PATH'] || join(process.cwd(), 'satisplan.db');
    
    // Initialize database
    db = new DatabaseClass(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create schema - find it dynamically
    const schemaPath = findSchemaPath();
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    
    return db;
  } catch (error) {
    // If initialization fails (e.g., during prerendering), return a null-like object
    // that will cause errors when used, so we know initialization failed
    throw new Error(`Database initialization failed: ${error}`);
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

