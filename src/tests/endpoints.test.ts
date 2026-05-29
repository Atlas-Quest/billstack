import test from "ava";
import { startTestServer, type TestServer } from "./helpers/server.js";

type TestContext = TestServer;

test.before(async (t) => {
  t.context = (await startTestServer()) as TestContext;
});

test.after.always((t) => {
  const { server } = t.context as TestContext;
  server.close();
});

test.serial("GET /unknown returns 404", async (t) => {
  const { baseUrl } = t.context as TestContext;

  const response = await fetch(`${baseUrl}/unknown`);
  t.is(response.status, 404);
});
