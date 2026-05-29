import test from "ava";
import { startTestServer, type TestServer } from "./helpers/server.ts";

type TestContext = TestServer;

test.before(async (t) => {
  t.context = (await startTestServer()) as TestContext;
});

test.after.always((t) => {
  const { server } = t.context as TestContext;
  server.close();
});

test.serial("creates a tenant", async (t) => {
  const { baseUrl } = t.context as TestContext;
  const response = await fetch(`${baseUrl}/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "SelfPsy",
    }),
  });
  t.is(response.status, 200);
  const tenant = await response.json();
  t.is(tenant.name, "SelfPsy");
});
