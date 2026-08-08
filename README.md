# Smart Leads Agent for Hoardings 🚀
> **DigiPlus IT Agentic AI Hackathon Solution (Q5)**  
> *Thakur College of Engineering & Technology*

An intelligent, explainable, agentic lead generation platform for outdoor advertising billboard inventory management. Replaces guesswork and spreadsheets with automated 90-day vacancy detection, multi-factor customer fit scoring, zero-hallucination pitch generation, and interactive visual analytics.

---

## 💡 Problem Solved
Billboard sales teams historically lose revenue when site bookings expire silently. Sites remain blank while sales cold-calls at random. **Smart Leads Agent** detects every hoarding coming vacant in the next 90 days, computes total revenue at risk, ranks the top-3 best-fit customers with human-explainable reasons, and generates a personalized multi-channel pitch in 1 click.

---

## ✨ Features & Innovation

### Core Requirements
1. **90-Day Vacancy Pipeline**: Automatically identifies billboards with active bookings ending within 90 days (or currently vacant) that have **no follow-on booking**. Computes exact `free_from_date` and `revenue_at_risk`.
2. **Explainable Lead Fit Engine**: Ranks customers using a 100-point multi-factor model:
   - **Budget Affordability Match (30 pts)**: Strictly penalizes and blocks low-budget clients from topping premium sites.
   - **Past History Affinity (25 pts)**: Rewards past tenancy on exact site or zone history.
   - **Industry-Demographic Synergy (25 pts)**: Matches customer industry with zone traffic demographics.
   - **Relationship & Recency (20 pts)**: Rewards active accounts and flags cold relationships (>60 days without contact).
   - Every lead outputs explicit bulleted **"Why this customer for this site?"** reasons.
3. **1-Click AI Pitch Generator**: Generates customized pitch content for Email, WhatsApp, or Sales Phone Script quoting exact rate card prices and site facts with zero invented numbers.

### Bonus Features Included
- 🔴 **Incumbent Tenant Churn & Renewal Predictor**: Predicts tenant renewal vs churn risk percentage and recommends retention strategies.
- 🗺️ **Interactive City Billboard Map View**: Leaflet map visualizing 300 hoardings across city zones with color-coded vacancy markers and popup lead matches.
- 📊 **90-Day Visual Gantt Timeline**: Timeline grid showing active bookings vs upcoming vacancy gaps.
- ⚡ **Dynamic Strategy Modes**: Toggle between Balanced Fit, Revenue Maximizer, and Speed Fill / Renewal modes.

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js REST API
- **Frontend**: React (Vite), Lucide Icons, Leaflet Maps, Vanilla CSS Design System (Dark Glassmorphism)
- **Data Engine**: CSV Loader & Synthetic Data Generator (`hoardings.csv`, `bookings.csv`, `customers.csv`)

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+) & npm

### Setup & Launch
```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Run Data Generator (Optional - pre-generated CSVs included)
npm run generate-data

# 3. Start Backend REST API (Port 5001)
npm start

# 4. In a new terminal, launch Frontend Cockpit (Port 3000)
cd ../frontend
npm install
npm run dev
```

### Run Validation Suite
```bash
cd backend
node tests/verifyRules.js
```
