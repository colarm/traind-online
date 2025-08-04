import express from 'express'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import mongoose from 'mongoose'
import app from './app'

dotenv.config()

const PORT = process.env.PORT || 4000

// Prisma
const prisma = new PrismaClient()

// MongoDB
const MONGO_MAIN_URI = process.env.MONGO_MAIN_URI || 'mongodb://localhost:27017/traind_main'

async function startServer() {
  try {
    // Connect MongoDB
    await mongoose.connect(MONGO_MAIN_URI)
    console.log('✅ Connected to MongoDB')

    // Test Prisma
    await prisma.$connect()
    console.log('✅ Connected to PostgreSQL via Prisma')

    app.use(express.json())

    // Example API route
    app.get('/api/ping', (req, res) => {
      res.json({ message: 'pong' })
    })

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

startServer()
