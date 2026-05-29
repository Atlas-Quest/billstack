import express from "express";

const app = express();

app.use(express.json());

app.post("/users", (req, res) => {
  return res.json(req.body);
});

app.post("/tenants", (req, res) => {
  return res.json(req.body);
});

export default app;
