/**
 * Express application configuration
 * Sets up middleware and routes for the Train-D Online backend
 */

import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes";

const app = express();

// Configure request body parsing with size limits
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Enable cookie parsing for authentication
app.use(cookieParser());

// Mount API routes
app.use("/api", routes);

export default app;
