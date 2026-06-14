import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models import Product, UserProfile

# ── TF-IDF Vectorizer (fit once at import time) ───────────────────────────────

def _build_product_corpus(products: list[Product]) -> list[str]:
    """
    Concatenate all textual signals per product into one document.
    Category is repeated 3× to give it stronger weight in TF-IDF.
    """
    docs = []
    for p in products:
        doc = " ".join([
            p.title,
            p.description,
            p.category * 3,          # boost category weight
            p.conditionType,
            p.conditionGrade * 2,    # boost condition weight
        ])
        docs.append(doc.lower())
    return docs


def build_tfidf_matrix(products: list[Product]):
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words="english",
        max_features=500,
    )
    corpus = _build_product_corpus(products)
    matrix = vectorizer.fit_transform(corpus)
    return vectorizer, matrix


# ── User preference vector ────────────────────────────────────────────────────

def build_user_query(user: UserProfile, products_by_id: dict[int, Product]) -> str:
    """
    Fuse interests + search history + titles of browsed products
    into a single query string representing the user's taste.
    """
    parts: list[str] = []

    # Interests (repeated for weight)
    for interest in user.interests:
        parts.extend([interest] * 3)

    # Search history terms
    parts.extend(user.searchHistory)

    # Titles of browsed products
    for pid in user.browsingHistory:
        p = products_by_id.get(pid)
        if p:
            parts.append(p.title)
            parts.append(p.category)

    return " ".join(parts).lower()


# ── Core scoring ──────────────────────────────────────────────────────────────

def compute_similarity_scores(
    user_query: str,
    vectorizer: TfidfVectorizer,
    product_matrix,
) -> np.ndarray:
    user_vec = vectorizer.transform([user_query])
    scores   = cosine_similarity(user_vec, product_matrix).flatten()
    return scores
