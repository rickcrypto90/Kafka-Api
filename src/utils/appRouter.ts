import fs from 'fs';
import path from 'path';
import { Express, Router } from 'express';

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

async function scanDir(dir: string): Promise<Record<string, string>> {
  const files = fs.readdirSync(dir);
  const routes: Record<string, string> = {};

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const nestedRoutes = await scanDir(filePath);
      Object.assign(routes, nestedRoutes);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const routePath = path
        .relative(path.join(__dirname, '..', 'routes'), filePath)
        .replace(/\.[jt]s$/, '')
        .replace(/\/index$/, '')
        .replace(/\[(.+)\]/g, ':$1');

      routes[routePath] = filePath;
    }
  }

  return routes;
}

async function appRouter(app: Express): Promise<void> {
  const routesDir = path.join(__dirname, '..', 'routes');

  try {
    const routes = await scanDir(routesDir);
    const newRoutes = Object.fromEntries(
      Object.entries(routes).map(([key, value]) => [toKebabCase(key), value])
    );

    for (const [routePath, filepath] of Object.entries(newRoutes)) {
      let route: Router;
      try {
        route = (await import(filepath)).default;
      } catch (error) {
        console.error(`Error loading module ${filepath}:`, error);
        continue;
      }

      if (!route) {
        console.log(
          `Missing export in ${routePath} ---> ${filepath} (ctrl + click to open)`
        );
        continue;
      }

      if (typeof route !== 'function' && !Array.isArray(route)) {
        console.log(
          `Invalid route export in ${routePath} ---> ${filepath}. Expected a function or an array of middleware.`
        );
        continue;
      }

      app.use('/' + toKebabCase(routePath), route);
    }
  } catch (error) {
    console.error('Error in appRouter:', error);
  }
}

export default appRouter;