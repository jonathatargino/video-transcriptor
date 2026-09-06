import express from "express";
import { getAppRouter } from "./routes/index.js";
import dotenvx from "@dotenvx/dotenvx";
import { notFoundHandler } from "./middlewares/not-found-handler.js";
import { errorHandler } from "./middlewares/error-handler.js";

dotenvx.config();

const app = express();

app.use(express.json());

app.get("/", (_req, res) => res.sendStatus(200));

app.use("/api/v1", getAppRouter());

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(3009, () => console.log("App running on port 3009"));
