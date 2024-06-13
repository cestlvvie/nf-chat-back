import "dotenv/config";
import express from "express";
import { createServer } from "http";
import connectDB from "./db";
import initWebsockets from "./websockets/server";
import globalRouter from "./global-router";
import { logger } from "./logger";


const cors = require('cors');

connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
    // Add headers as needed
}));
app.use(express.json());
app.use(logger);
app.use("/api", globalRouter);

const server = createServer(app);
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

initWebsockets(server);
