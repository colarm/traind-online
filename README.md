# 🚀 Traind.online — AI-Assisted Reddit Trend Clustering Platform

**Author**: Haicheng Zhao  
**University**: University of Glasgow, MSc IT+ Individual Project  
**Supervisor**: Md Shakil Ahmed  
**Duration**: 12 Weeks

---

## 🧠 Overview

**Traind.online** is an interactive AI-powered platform that analyses real-time Reddit discussions to uncover thematic clusters and trending events. Users—ranging from social science researchers to casual observers—can explore public discourse evolution, detect community sentiment, and trace event propagation paths through intuitive visualisations.

Built as a full-stack microservice application, the system separates concerns across frontend, backend, machine learning, and data ingestion services. Clustering is customisable and visualised in real time, making the system useful for analysis, demonstration, and further research.

---

## 👥 Target Users

This platform is tailored for three main personas:

- **Trend Analysts**: Research-oriented users interested in discourse evolution and topic correlation.
- **Data Enthusiasts**: Technically proficient users eager to explore, adjust parameters, and export results.
- **Casual Observers**: General Reddit users seeking a daily snapshot of what’s trending.

---

## ✨ Features

- 🔐 Secure user authentication with JWT and cookies
- 📊 Interactive clustering controls (k-value, vectoriser, distance metric)
- 🧠 Real-time ML clustering using SentenceTransformer + HDBSCAN via gRPC
- 📈 Topic evolution charts and subreddit breakdowns with D3.js
- 🔄 Automated Reddit data collection and processing pipeline
- 🗄️ Hybrid database architecture (PostgreSQL + MongoDB)
- 📦 Fully containerised microservice deployment
- 🌐 RESTful API for frontend communication + gRPC for ML services
- 💬 Interactive data exploration with hover previews and drilldowns

---

## 🛠️ Tech Stack

| Layer               | Technology                                                 |
| ------------------- | ---------------------------------------------------------- |
| **Frontend**        | React.js, TypeScript, Vite, D3.js                          |
| **Backend**         | Node.js, Express, TypeScript, Prisma ORM                   |
| **ML Service**      | Python, sentence-transformers, HDBSCAN, scikit-learn, gRPC |
| **Data Pipeline**   | Python, pandas, numpy, data processing                     |
| **Data Collection** | Python, PRAW (Reddit API), automated crawling              |
| **Databases**       | PostgreSQL (Main DB), MongoDB (Raw Data)                   |
| **Communication**   | REST API (HTTPS), gRPC, HTTP                               |
| **DevOps**          | Docker, Docker Compose, PM2                                |

---

## 🔄 System Architecture

The system follows a microservice architecture with clear separation of concerns, as illustrated in the architecture diagram:

### Core Components:

- **Frontend UI (React.js/TypeScript)**: Responsive user interface for data visualisation and interaction
- **Backend (Node.js/TypeScript)**:
  - Handles user authentication and API routing via HTTPS
  - Manages user data through Prisma ORM
  - Communicates with gRPC Service for ML operations
- **gRPC Service (Python)**: Receives clustering requests and manages task queue distribution
- **Pipeline (Python)**: Task queue system for managing analysis workflows
- **Crawler & Analysis (Python)**: Core ML analysis module that processes tasks from pipeline
  - Fetches Reddit data using PRAW API
  - Performs SentenceTransformer embeddings and HDBSCAN clustering
  - Executes sentiment analysis and topic classification

### Data Layer:

- **Main DB (PostgreSQL)**: Stores user authentication, preferences, and application metadata (connected via Prisma)
- **Raw Data DB (MongoDB)**: Stores Reddit posts, comments, and unstructured data from crawling operations

### Communication Protocols:

1. **User ↔ Frontend UI**: Direct user interaction through web interface
2. **Frontend UI ↔ Backend**: HTTPS REST API for all user interactions and data requests
3. **Backend ↔ Main DB**: Prisma ORM connection to PostgreSQL for user data management
4. **Backend ↔ gRPC Service**: gRPC protocol for high-performance ML clustering operations
5. **gRPC Service ↔ Pipeline**: Adds analysis tasks to pipeline queue for processing
6. **Pipeline ↔ Crawler & Analysis**: Task distribution and ML analysis execution
7. **Crawler & Analysis ↔ Reddit**: PRAW API integration for real-time data ingestion
8. **Crawler & Analysis ↔ Raw Data DB**: Data storage and retrieval for ML processing

---

## 🎯 Project Objectives

- Deliver a professional-grade full-stack application aligned with MSc IT+ outcomes
- Enable exploratory analysis and visualisation of Reddit trends
- Demonstrate microservice architecture and real-time AI integration
- Address the needs of both technical and non-technical audiences

---

## 🚀 Development Setup (Windows)

### Prerequisites

Before setting up the project, ensure you have the following installed on your Windows development environment:

#### Required Software:

- **Node.js** (v18+): [Download from nodejs.org](https://nodejs.org/)
- **Git**: [Download from git-scm.com](https://git-scm.com/)
- **Docker Desktop**: [Download from docker.com](https://www.docker.com/products/docker-desktop/)

#### Development Tools (Recommended):

- **Visual Studio Code**: [Download from code.visualstudio.com](https://code.visualstudio.com/)
- **Windows Terminal**: Available from Microsoft Store

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://stgit.dcs.gla.ac.uk/msc-project-for-information-technology/2024/it-project-2960799z/traind-online.git
cd traind-online
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
copy .env.example .env
# Edit .env file with your database credentials and API keys

# Start databases (PostgreSQL and MongoDB)
docker-compose up -d

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Start the backend server
npm run dev
```

#### 3. Frontend Setup

```bash
# Open new terminal window
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

#### 4. Machine Learning Service Setup

```bash
# Start ML service with Docker (Windows)
cd ml/docker
docker-compose -f docker-compose.windows.yml up -d

# View logs (optional)
docker-compose -f docker-compose.windows.yml logs -f ml-service
```

### Environment Configuration

#### Backend (.env)

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# Database Configuration
POSTGRES_USER=traind
POSTGRES_PASSWORD=123456
POSTGRES_DB=traind_db
DATABASE_URL=postgresql://traind:123456@localhost:5432/traind_db?schema=public

# MongoDB Configuration (for ML data storage)
MONGO_MAIN_URI=mongodb://localhost:27017/traind_main

# Authentication
JWT_SECRET=supersecretkey
COOKIE_SECURE=false

# ML Service Configuration
ML_SERVICE_URL=127.0.0.1:50051

# Internal API Security
INTERNAL_API_KEY=sk_internal_traind_2024_a8f9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

# Application Environment
NODE_ENV=development

# Email Configuration (Optional for development)
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM_NAME=Traind.online
EMAIL_FROM=noreply@traind.online
```

#### ML Service (.env)

Copy `ml/.env.example` to `ml/.env` and configure:

```env
# Reddit API Credentials (Required for data collection)
REDDIT_CLIENT_ID=YOUR_REDDIT_CLIENT_ID_HERE
REDDIT_CLIENT_SECRET=YOUR_REDDIT_CLIENT_SECRET_HERE
REDDIT_USER_AGENT=traind-ml-analyzer:v1.0.0 (by /u/YOUR_USERNAME)

# Backend Communication
BACKEND_URL=http://localhost:4000
INTERNAL_API_KEY=sk_internal_traind_2024_a8f9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

#### Frontend Configuration

The frontend uses Vite's built-in proxy configuration. No separate `.env` file needed.
API requests are automatically proxied to `http://localhost:4000` via Vite config.

#### Getting Reddit API Credentials

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Note down the client ID and secret
5. Use format: `traind-ml-analyzer:v1.0.0 (by /u/YOUR_REDDIT_USERNAME)` for user agent

#### Important Notes

- Use the same `INTERNAL_API_KEY` in both backend and ML service `.env` files
- For production deployment, change `COOKIE_SECURE=true` and use strong passwords
- Email configuration is optional for local development but required for password reset functionality
- Ensure Docker Desktop is running before starting any services
- The ML service requires the backend to be accessible at `http://localhost:4000` for internal communication

### Running the Full Stack

1. **Start Databases**: `cd backend && docker-compose up -d`
2. **Start ML Service**: `cd ml/docker && docker-compose -f docker-compose.windows.yml up -d`
3. **Start Backend**: `cd backend && npm run dev`
4. **Start Frontend**: `cd frontend && npm run dev`

Access the application at `http://localhost:5173` (frontend) and `http://localhost:4000` (backend API).

### Troubleshooting

#### Common Issues:

- **Port conflicts**: Ensure ports 4000, 5173, 5432, 27017, 50051 are available
- **Database connection**: Verify PostgreSQL and MongoDB are running via Docker
- **Docker issues**: Restart Docker Desktop if containers fail to start
- **ML service connectivity**: Check if gRPC port 50051 is accessible

#### Windows-Specific:

- Use PowerShell or Command Prompt as Administrator if needed
- Ensure Windows Subsystem for Linux (WSL2) is enabled for Docker
- Check Windows Defender/antivirus settings if builds fail

#### Docker-Specific:

- If ML service fails to start: `cd ml/docker && docker-compose -f docker-compose.windows.yml logs ml-service`
- Rebuild ML container: `cd ml/docker && docker-compose -f docker-compose.windows.yml build ml-service`
- Reset ML container: `cd ml/docker && docker-compose -f docker-compose.windows.yml down && docker-compose -f docker-compose.windows.yml up -d`
- Reset databases: `cd backend && docker-compose down && docker-compose up -d`

---

## 🌐 Live Platform

🔗 [https://traind.online](https://traind.online)

---

## 📜 License & Intellectual Property

This project was developed as part of the MSc IT+ individual development project at the University of Glasgow.

**Intellectual Property Rights**: The student (Haicheng Zhao) retains full intellectual property rights to this work.

**Third-Party Components**: This project utilises open-source libraries and frameworks under their respective licences. All third-party dependencies are properly attributed and used in compliance with their licensing terms.
