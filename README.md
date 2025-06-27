# Traind.online – Social Trend Clustering and Visualization System

**Developer**: Haicheng Zhao
**GUID**: 2960799Z
**Supervisor**: Md Shakil Ahmed
**University**: University of Glasgow, MSc IT+ Individual Project

---

## Overview

**Traind.online** is a full-stack web application developed to analyze trending Reddit discussions in real time. It uses machine learning techniques to cluster posts into thematic "events" and visualizes subreddit-level engagement over time.

This project was developed as part of the MSc IT+ 12-week individual development project.

---

## Project Structure

```
traind.online/
├── frontend/         React + TypeScript interface (Vite)
├── backend/          Node.js + TypeScript API
├── ml/               Python machine learning pipeline
├── data-collector/   Python Reddit scraper (PRAW)
├── docs/             Diagrams, API specs
├── tests/            Unit and integration tests
└── README            This document
```

---

## Technologies Used

* **Frontend**: React, TypeScript, D3.js, Axios
* **Backend**: Node.js, Express, TypeScript
* **Machine Learning**: Python, scikit-learn, TF-IDF, MiniBatchKMeans
* **Database**: MongoDB
* **Dev Tools**: GitLab, Vite, Nodemon, ts-node, PRAW API

---

## Key Features

* Real-time Reddit data collection from selected subreddits
* Clustering of topics using unsupervised learning
* Event-based trend visualization and topic tracking
* Subreddit contribution analytics
* Interactive and responsive UI for exploring clusters

---

## Setup Instructions

1. **Clone the repository** (hosted on SoCS GitLab)
2. **Install dependencies**:

   * Frontend: `npm install` inside `frontend/`
   * Backend: `npm install` inside `backend/`
   * ML/Data tools: `pip install -r requirements.txt` inside `ml/` and `data-collector/`
3. **Configure environment variables** in `.env` files (MongoDB URI, PRAW credentials)
4. **Run services**:

   * Backend: `npm run start`
   * Frontend: `npm run dev`
   * ML pipeline: Manual or integrated
   * Data collector: Scheduled or manual Python script

---

## Status

Project actively developed and deployed locally. Data pipeline, clustering, and frontend visualizations are functioning. Evaluation and testing in progress as part of dissertation phase.

---

## Assessment Deliverables

* Dissertation (max 20 pages from Introduction)
* Source code (with GitLab history)
* Video demonstration (\~10 minutes)
* Progress tracker (weekly updates)
* Viva (Weeks 10–11)
* Supporting materials (ethics form, diagrams, etc.)