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

test.serial("creates a user", async (t) => {
  const { baseUrl } = t.context as TestContext;
  const response = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Daphne Calm",
      email: "daphne@selfpsy.com",
    }),
  });
  t.is(response.status, 200);
  const user = await response.json();
  t.is(user.name, "Daphne Calm");
  t.is(user.email, "daphne@selfpsy.com");
});
