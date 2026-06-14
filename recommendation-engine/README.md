# Amazon ReMatch — Recommendation Engine

Content-based filtering microservice that recommends returned/refurbished products
to users most likely to purchase them.

## Folder Structure

```
recommendation-engine/
├── app/
│   ├── __init__.py
│   ├── data.py          # Mock users + product catalogue (mirrors Java entities)
│   ├── engine.py        # TF-IDF vectorizer + cosine similarity core
│   ├── models.py        # Pydantic schemas
│   └── recommender.py   # Composite scoring + match reason generation
├── main.py              # FastAPI app + GET /recommendations/{userId}
├── requirements.txt
└── README.md
```

## Setup

```bash
cd recommendation-engine

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

## API

### `GET /recommendations/{userId}?top=10`

Returns ranked product recommendations for a user.

**Path Parameter**

| Param  | Type | Description        |
|--------|------|--------------------|
| userId | int  | User ID (1–5 mock) |

**Query Parameter**

| Param | Type | Default | Description            |
|-------|------|---------|------------------------|
| top   | int  | 10      | Max results (1–20)     |

**Response — `200 OK`**

```json
{
  "userId": 1,
  "totalRecommendations": 10,
  "recommendations": [
    {
      "product": {
        "id": 17,
        "title": "White Gold Diamond Stud Earrings",
        "category": "Jewellery",
        "conditionGrade": "A",
        "conditionType": "RETURNED",
        "lifeScore": 97,
        "price": 299.99,
        "originalPrice": 499.99,
        "rating": 4.8,
        "reviewCount": 412,
        "aiVerified": true,
        ...
      },
      "matchScore": 78.4,
      "matchReasons": [
        "Matches your interest in Electronics",
        "Related to your search \"wireless headphones\"",
        "Grade A condition — like new quality",
        "43% off original price"
      ]
    }
  ]
}
```

**Error Responses**

| Status | Reason              |
|--------|---------------------|
| 404    | User ID not found   |
| 422    | Invalid query param |

### `GET /users`

Lists all mock users with their interests.

### `GET /health`

```json
{ "status": "ok" }
```

## Algorithm

### Step 1 — Build Product Corpus (TF-IDF)

Each product becomes a document:
```
"{title} {description} {category×3} {conditionType} {conditionGrade×2}"
```
Category is repeated 3× and grade 2× to amplify their weight in the TF-IDF space.
A `TfidfVectorizer` with bigrams (`ngram_range=(1,2)`) and 500 features fits all products.

### Step 2 — Build User Query Vector

The user's taste is expressed as a single query string fused from:
```
interests×3 + searchHistory + titles/categories of browsed products
```
This query is transformed by the same vectorizer.

### Step 3 — Cosine Similarity

```
similarity = cosine_similarity(user_vector, product_matrix)
```
Each product gets a relevance score 0–1 against the user's taste profile.

### Step 4 — Composite Score

Products already in the user's browsing history are excluded, then:

```
matchScore =
    tfidf_similarity  × 0.55   (content relevance)
  + life_score / 100  × 0.15   (product condition quality)
  + grade_weight      × 0.15   (A=1.0, B=0.8, C=0.6, D=0.4)
  + rating / 5        × 0.10   (community trust)
  + ai_verified_bonus × 0.05   (+5% if AI-verified)
  × 100
```

### Step 5 — Match Reasons

Human-readable reasons are generated per recommendation:
- Interest match
- Search term match
- Category browsing pattern
- Condition/Life score highlights
- Discount percentage

---

## Integration with Other Services

```
GET :8002/recommendations/1?top=5
         ↓  grade: "A", product id: 17
POST :8001/condition/analyze  (image re-check)
         ↓  conditionGrade: "A"
POST :8080/lifescore/calculate { conditionGrade:"A", productAgeYears:1, popularityScore:85 }
         ↓  lifeScore: 93
```

## Mock Users

| ID | Name  | Interests                          |
|----|-------|------------------------------------|
| 1  | Alice | Electronics, Women's Clothing      |
| 2  | Bob   | Electronics, Men's Clothing        |
| 3  | Carol | Jewellery, Women's Clothing        |
| 4  | David | Men's Clothing                     |
| 5  | Eve   | Electronics, Jewellery             |
