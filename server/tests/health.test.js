const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const app = require("../src/app");

test("Health Check Integration Tests", async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => {
    server.close();
  });

  await t.test("GET / should return 200 and API status", async () => {
    const res = await fetch(`${baseUrl}/`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.message.includes("Fitness Buddy Pro API"));
  });

  await t.test("GET /api/v1/health should return health telemetry", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.service, "fitness-buddy-pro-api");
    assert.strictEqual(data.version, "2.0.0");
    assert.ok(typeof data.uptimeSeconds === "number");
    assert.ok(data.database !== undefined);
  });
});
