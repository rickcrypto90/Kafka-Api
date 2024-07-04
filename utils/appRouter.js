import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

async function appRouter(app) {
  const routesDir = path.join(__dirname, "..", "routes");
  // console.log("Scanning for routes in:", routesDir);

  async function scanDir(dir) {
    // console.log("Scanning directory:", dir);
    const files = fs.readdirSync(dir);
    const routes = {};

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // console.log("Found directory:", filePath);
        const nestedRoutes = await scanDir(filePath);
        Object.assign(routes, nestedRoutes);
      } else if (file.endsWith(".js")) {
        // console.log("Found file:", filePath);
        const routePath = path
          .relative(routesDir, filePath)
          .replace(/\.[jt]s$/, "")
          .replace(/\/index$/, "")
          .replace(/\[(.+)\]/g, ":$1");

        routes[routePath] = filePath;
      }
    }

    return routes;
  }

  try {
    const routes = await scanDir(routesDir);
    // console.log("Scanned routes:", routes);

    const newRoutes = Object.fromEntries(
      Object.entries(routes).map(([key, value]) => [toKebabCase(key), value])
    );
    // console.log("Processed routes:", newRoutes);

    for (const [path, filepath] of Object.entries(newRoutes)) {
      let route;
      try {
        // console.log(`Attempting to import: ${filepath}`);
        route = await import(filepath);
        route = route.default || route;
        // console.log(`Successfully imported: ${filepath}`);
      } catch (error) {
        console.error(`Error loading module ${filepath}:`, error);
        continue;
      }

      if (!route) {
        console.log(
          `Missing export in ${path} ---> ${filepath} (ctrl + click to open)`
        );
        continue;
      }

      if (typeof route !== "function" && !Array.isArray(route)) {
        console.log(
          `Invalid route export in ${path} ---> ${filepath}. Expected a function or an array of middleware.`
        );
        continue;
      }

      // console.log(`Registering route: /${toKebabCase(path)}`);
      app.use("/" + toKebabCase(path), route);
    }
  } catch (error) {
    console.error("Error in appRouter:", error);
  }
}

export default appRouter;
