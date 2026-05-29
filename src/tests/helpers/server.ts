import { createServer, type Server } from "node:http";
import app from "../../index.js";

export type TestServer = {
  server: Server;
  baseUrl: string;
};

export async function startTestServer(): Promise<TestServer> {
  const server = createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.listen(0, "127.0.0.1", (err?: Error) => {
      if (err) return reject(err);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to bind test server");
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}
