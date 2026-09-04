import express from "express";
import { getAppRouter } from "./routes/index.js";
import dotenvx from "@dotenvx/dotenvx";

dotenvx.config();

const app = express();

app.get("/", (_req, res) => res.sendStatus(200));

app.use("/api/v1", getAppRouter());

app.listen(3009, () => console.log("App running on port 3009"));
