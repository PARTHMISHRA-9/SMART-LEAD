# python_services/main.py
"""
Python Analytics & Data Science Service for OOH Revenue Recovery
---------------------------------------------------------------
EXPLAINABLE DATA SCIENCE ARCHITECTURE:
- FastAPI microservice providing advanced analytical capabilities:
  1. Cosine similarity for customer vector profiles.
  2. Matrix feature similarity for hoarding billboard sites.
  3. Revenue recovery statistical forecasting with confidence tiers.
  4. Data Health & Anomaly Audit.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math

app = FastAPI(
    title="OOH Revenue Recovery Python Analytics Engine",
    version="2.0.0",
    description="Data Science service providing vector similarity and statistical forecasting for Smart Leads Agent"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CustomerVector(BaseModel):
    customer_id: str
    company_name: str
    max_budget_monthly: float
    relationship_score: float
    days_since_contact: int
    industry: str

class SiteVector(BaseModel):
    site_id: str
    location_name: str
    zone: str
    monthly_rate: float
    traffic_score: float
    daily_impressions: float
    size: str

class SimilarityRequest(BaseModel):
    target_customer: CustomerVector
    candidate_customers: List[CustomerVector]

class SiteSimilarityRequest(BaseModel):
    target_site: SiteVector
    candidate_sites: List[SiteVector]

class ForecastItem(BaseModel):
    site_id: str
    monthly_rate: float
    days_until_vacant: int
    fit_score: float
    churn_risk_pct: float

class ForecastRequest(BaseModel):
    vacancies: List[ForecastItem]

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes exact cosine similarity between two feature vectors."""
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)

@app.get("/health")
def health():
    return {
        "status": "ONLINE",
        "service": "Python Data Science Engine",
        "engine": "FastAPI + Cosine Vector Analytics"
    }

@app.post("/analytics/similarity/customers")
def calculate_customer_similarity(req: SimilarityRequest):
    """Calculates vector similarity between a target customer and candidate customers."""
    target = req.target_customer
    results = []

    # Normalized features: [budget/50000, rel_score/100, (120-days)/120]
    target_vec = [
        target.max_budget_monthly / 50000.0,
        target.relationship_score / 100.0,
        max(0, 120 - target.days_since_contact) / 120.0
    ]

    for cand in req.candidate_customers:
        if cand.customer_id == target.customer_id:
            continue
        
        cand_vec = [
            cand.max_budget_monthly / 50000.0,
            cand.relationship_score / 100.0,
            max(0, 120 - cand.days_since_contact) / 120.0
        ]
        
        sim_score = cosine_similarity(target_vec, cand_vec)
        
        # Industry bonus
        if cand.industry == target.industry:
            sim_score = min(1.0, sim_score + 0.15)

        pct = round(sim_score * 100, 1)

        results.append({
            "customer_id": cand.customer_id,
            "company_name": cand.company_name,
            "industry": cand.industry,
            "similarity_score_pct": pct,
            "reasons": [
                f"Same industry sector ({cand.industry})" if cand.industry == target.industry else "Cross-industry match",
                f"Budget vector alignment: ${cand.max_budget_monthly:,.0f} vs ${target.max_budget_monthly:,.0f}",
                f"Relationship touchpoint score: {cand.relationship_score}/100"
            ]
        })

    results.sort(key=lambda x: x["similarity_score_pct"], reverse=True)
    return {"target_customer_id": target.customer_id, "similar_customers": results[:5]}

@app.post("/analytics/similarity/sites")
def calculate_site_similarity(req: SiteSimilarityRequest):
    """Calculates vector similarity between a target billboard site and candidate sites."""
    target = req.target_site
    results = []

    target_vec = [
        target.monthly_rate / 30000.0,
        target.traffic_score / 100.0,
        target.daily_impressions / 150000.0
    ]

    for cand in req.candidate_sites:
        if cand.site_id == target.site_id:
            continue

        cand_vec = [
            cand.monthly_rate / 30000.0,
            cand.traffic_score / 100.0,
            cand.daily_impressions / 150000.0
        ]

        sim_score = cosine_similarity(target_vec, cand_vec)
        if cand.zone == target.zone:
            sim_score = min(1.0, sim_score + 0.20)

        pct = round(sim_score * 100, 1)

        results.append({
            "site_id": cand.site_id,
            "location_name": cand.location_name,
            "zone": cand.zone,
            "monthly_rate": cand.monthly_rate,
            "similarity_score_pct": pct,
            "reasons": [
                f"Same geographic zone ({cand.zone})" if cand.zone == target.zone else "Cross-zone alternative",
                f"Rate card proximity: ${cand.monthly_rate:,.0f}/mo vs ${target.monthly_rate:,.0f}/mo",
                f"Traffic density alignment: Score {cand.traffic_score}/100"
            ]
        })

    results.sort(key=lambda x: x["similarity_score_pct"], reverse=True)
    return {"target_site_id": target.site_id, "similar_sites": results[:5]}

@app.post("/analytics/forecast/recovery")
def forecast_revenue_recovery(req: ForecastRequest):
    """Computes statistical revenue recovery forecast across confidence tiers."""
    total_risk = sum(item.monthly_rate * 3 for item in req.vacancies)
    high_conf = 0.0
    med_conf = 0.0
    low_conf = 0.0

    for item in req.vacancies:
        risk_value = item.monthly_rate * 3
        
        # Calculate conversion probability from fit score & days remaining
        prob = (item.fit_score / 100.0) * (1.0 - (item.churn_risk_pct / 200.0))
        
        if item.days_until_vacant > 30:
            prob *= 1.15
        
        prob = min(0.95, max(0.05, prob))

        if prob >= 0.70:
            high_conf += risk_value * prob
        elif prob >= 0.40:
            med_conf += risk_value * prob
        else:
            low_conf += risk_value * prob

    total_recovery = high_conf + med_conf + low_conf

    return {
        "total_revenue_at_risk": round(total_risk, 2),
        "total_expected_recovery": round(total_recovery, 2),
        "high_confidence_recovery": round(high_conf, 2),
        "medium_confidence_recovery": round(med_conf, 2),
        "uncertain_recovery": round(low_conf, 2),
        "recovery_rate_pct": round((total_recovery / total_risk * 100) if total_risk > 0 else 0, 1)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
