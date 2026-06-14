from pydantic import BaseModel
from typing import Optional


class UserProfile(BaseModel):
    userId: int
    name: str
    interests: list[str]          # e.g. ["Electronics", "Men's Clothing"]
    browsingHistory: list[int]    # product IDs viewed
    searchHistory: list[str]      # raw search terms
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None


class Product(BaseModel):
    id: int
    title: str
    description: str
    category: str
    conditionGrade: str           # A | B | C | D
    conditionType: str            # RETURNED | REFURBISHED
    lifeScore: int                # 0-100
    price: float
    originalPrice: float
    rating: float
    reviewCount: int
    imageUrl: str
    aiVerified: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None


class RecommendedProduct(BaseModel):
    product: Product
    matchScore: float             # 0-100 %
    matchReasons: list[str]       # human-readable explanation
    distanceKm: Optional[float] = None
    resolvedAtKm: Optional[int] = None  # 25 | 50 | 100 | None = nationwide


class RecommendationResponse(BaseModel):
    userId: int
    totalRecommendations: int
    recommendations: list[RecommendedProduct]
    resolvedAtKm: Optional[int] = None  # ring used for this response


class NearbyUser(BaseModel):
    userId: int
    name: str
    city: Optional[str] = None
    state: Optional[str] = None
    distanceKm: Optional[float] = None
    resolvedAtKm: Optional[int] = None
    interestScore: float
    distanceScore: float
    finalScore: float
    matchScore: int
    topCategories: list[str]


class NearbyUsersResponse(BaseModel):
    productId: int
    totalUsers: int
    resolvedAtKm: Optional[int] = None
    users: list[NearbyUser]
