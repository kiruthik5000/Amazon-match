from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.data import USERS_BY_ID
from app.models import RecommendationResponse
from app.recommender import recommend

app = FastAPI(
    title="Amazon ReMatch — Recommendation Engine",
    description="Content-based filtering engine that recommends returned/refurbished products.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/recommendations/{userId}", response_model=RecommendationResponse)
def get_recommendations(
    userId: int,
    top: int = Query(default=10, ge=1, le=20, description="Max results to return"),
):
    user = USERS_BY_ID.get(userId)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {userId} not found")

    results = recommend(user, top_n=top)

    return RecommendationResponse(
        userId=userId,
        totalRecommendations=len(results),
        recommendations=results,
    )


@app.get("/users", summary="List all mock users")
def list_users():
    return [
        {"userId": u.userId, "name": u.name, "interests": u.interests}
        for u in USERS_BY_ID.values()
    ]


@app.get("/health")
def health():
    return {"status": "ok"}
