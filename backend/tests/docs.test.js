import fs from "fs";
import path from "path";
import { afterAll, describe, expect, it } from "vitest";
import { backendRoot } from "../services/files.js";
import { api, closeDb } from "./helpers.js";

afterAll(closeDb);

// Every `xRouter.get("/path", ...)` in the route files, as "METHOD /prefix/path".
const ROUTE_FILES = {
  "auth_route.js": "/auth",
  "admin_route.js": "/admin",
  "member_route.js": "/member",
  "demo_route.js": "/demo",
};

function routesInCode() {
  const found = new Set();
  const call = /Router\.(get|post|put|delete|patch)\(\s*"([^"]+)"/g;
  for (const [file, prefix] of Object.entries(ROUTE_FILES)) {
    const source = fs.readFileSync(path.join(backendRoot, "routes", file), "utf8");
    for (const [, method, route] of source.matchAll(call)) {
      const openApiPath = (prefix + route).replace(/:(\w+)/g, "{$1}");
      found.add(`${method.toUpperCase()} ${openApiPath}`);
    }
  }
  return found;
}

async function routesInSpec() {
  const spec = (await api().get("/openapi.json")).body;
  const found = new Set();
  for (const [route, operations] of Object.entries(spec.paths)) {
    for (const method of Object.keys(operations)) {
      found.add(`${method.toUpperCase()} ${route}`);
    }
  }
  return found;
}

// /auth/sign-up/{userType} and /auth/sign-up/{phoneNumber} are one Express
// pattern each but two documented operations, so compare by pattern shape.
const normalise = (route) => route.replace(/\{\w+\}/g, "{}");

describe("API documentation", () => {
  it("serves Swagger UI and the raw spec", async () => {
    const ui = await api().get("/docs/");
    expect(ui.status).toBe(200);
    expect(ui.headers["content-type"]).toMatch(/text\/html/);
    expect(ui.headers["content-security-policy"]).toContain("'unsafe-inline'");

    const spec = await api().get("/openapi.json");
    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toBe("3.0.3");
  });

  it("keeps inline scripts blocked on the API itself", async () => {
    const res = await api().get("/health");
    const csp = res.headers["content-security-policy"];
    expect(csp).toMatch(/script-src 'self';/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it("documents every route the code defines", async () => {
    const documented = new Set([...(await routesInSpec())].map(normalise));
    const missing = [...routesInCode()].map(normalise).filter((r) => !documented.has(r));
    expect(missing, "routes missing from docs/openapi.yaml").toEqual([]);
  });

  it("does not document routes that no longer exist", async () => {
    const inCode = new Set([...routesInCode()].map(normalise));
    // /health, /ping and /openapi.json live in app.js rather than a router.
    const appLevel = new Set(["GET /health", "GET /ping"]);
    const stale = [...(await routesInSpec())]
      .map(normalise)
      .filter((r) => !inCode.has(r) && !appLevel.has(r));
    expect(stale, "operations in docs/openapi.yaml with no matching route").toEqual([]);
  });

  it("gives every operation a summary and at least one response", async () => {
    const spec = (await api().get("/openapi.json")).body;
    for (const [route, operations] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(operations)) {
        expect(operation.summary, `${method} ${route} summary`).toBeTruthy();
        expect(Object.keys(operation.responses).length, `${method} ${route} responses`).toBeGreaterThan(0);
      }
    }
  });

  it("only points $ref at things that exist", async () => {
    const spec = (await api().get("/openapi.json")).body;
    const refs = [...JSON.stringify(spec).matchAll(/"\$ref":"#\/([^"]+)"/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThan(20);
    for (const ref of refs) {
      const target = ref.split("/").reduce((node, key) => node?.[key], spec);
      expect(target, `#/${ref}`).toBeDefined();
    }
  });
});
