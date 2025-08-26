# 🚀 Traind.online — AI-Assisted Reddit Trend Clustering Platform

**Author**: Haicheng Zhao  
**University**: University of Glasgow, MSc IT+ Individual Project  
**Supervisor**: Md Shakil Ahmed  
**Duration**: 12 Weeks  

---

## 🧠 Overview

**Traind.online** is an interactive AI-powered platform that analyzes real-time Reddit discussions to uncover thematic clusters and trending events. Users—ranging from social science researchers to casual observers—can explore public discourse evolution, detect community sentiment, and trace event propagation paths through intuitive visualizations.

Built as a full-stack microservice application, the system separates concerns across frontend, backend, machine learning, and data ingestion services. Clustering is customizable and visualized in real time, making the system useful for analysis, demonstration, and further research.

---

## 👥 Target Users

This platform is tailored for three main personas:

- **Trend Analysts**: Research-oriented users interested in discourse evolution and topic correlation.  
- **Data Enthusiasts**: Technically proficient users eager to explore, adjust parameters, and export results.  
- **Casual Observers**: General Reddit users seeking a daily snapshot of what’s trending.

---

## ✨ Features

- 🔐 Secure user authentication with JWT and cookies  
- 📊 Interactive clustering controls (e.g. `k-value`, vectorizer, distance metric)  
- 🧠 Real-time ML clustering using TF-IDF + MiniBatchKMeans (via gRPC)  
- 📈 Topic evolution charts and subreddit breakdowns  
- 📦 Fully containerized (Docker Compose) for portability and deployment  
- 📚 REST API for frontend/backend + gRPC for ML communication  
- 💬 Hover previews, trend timelines, topic drilldowns  

---

## 🛠️ Tech Stack

| Layer              | Technology                                        |
|--------------------|---------------------------------------------------|
| **Frontend**       | React (Vite), TypeScript, D3.js                   |
| **Backend**        | Node.js (Express), REST API, gRPC client          |
| **ML Module**      | Python, scikit-learn, TF-IDF, KMeans, gRPC server |
| **Data Store**     | MongoDB (Atlas/local), PostgreSQL (user auth)     |
| **Ingestion**      | Python + PRAW (Reddit API), cron scheduler        |
| **DevOps**         | Docker, Docker Compose, PM2                       |

---

## 🔄 System Architecture

- **Frontend**: Responsive UI for user interaction and data visualization  
- **Backend (Node.js)**: Handles auth, API routing, and triggers ML clustering  
- **ML Service (Python)**: Clustering engine accessed via gRPC  
- **Data Collector**: Scheduled scraper using PRAW; stores raw Reddit data in MongoDB  
- **Database**: Hybrid NoSQL (analysis data) and SQL (user data) structure  

---

## 🎯 Project Objectives

- Deliver a professional-grade full-stack application aligned with MSc IT+ outcomes  
- Enable exploratory analysis and visualization of Reddit trends  
- Demonstrate microservice architecture and real-time AI integration  
- Address the needs of both technical and non-technical audiences  

---

## 📈 Live Demo

🔗 [https://traind.online](https://traind.online)

---

## 📜 License

This project is for academic purposes as part of the MSc IT+ individual development project at the University of Glasgow.
