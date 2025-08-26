/**
 * Traind Online Backend Server
 * Main server entry point that initializes database connections and starts the Express server
 */

import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
import app from "./app";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

// Initialize Prisma client for PostgreSQL
const prisma = new PrismaClient();

// MongoDB connection URI
const MONGO_MAIN_URI =
  process.env.MONGO_MAIN_URI || "mongodb://localhost:27017/traind_main";

/**
 * Initialize and start the server with database connections
 */
async function startServer() {
  try {
    // Connect to MongoDB for main data storage
    await mongoose.connect(MONGO_MAIN_URI);
    console.log("✅ Connected to MongoDB");

    // Test PostgreSQL connection via Prisma
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL via Prisma");

    // Configure JSON parsing middleware
    app.use(express.json());

    // Health check endpoint
    app.get("/api/ping", (req, res) => {
      res.json({ message: "pong" });
    });

    // Start the HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
