from app.models import UserProfile, Product

# ── Products (matches Product entity: category, conditionGrade, lifeScore, etc.) ─

PRODUCTS: list[Product] = [
    Product(id=1,  title="Sony WH-1000XM4 Wireless Headphones",         description="Premium noise-cancelling wireless headphones with 30-hour battery and multi-device pairing",                                category="Electronics",        conditionGrade="A", conditionType="REFURBISHED", lifeScore=94, price=199.99, originalPrice=349.99, rating=4.7, reviewCount=2340, imageUrl="https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",            aiVerified=True),
    Product(id=2,  title="Samsung 49-Inch CHG90 Gaming Monitor",         description="Curved ultra-wide gaming monitor with 144Hz refresh rate and HDR support for immersive gaming",                             category="Electronics",        conditionGrade="B", conditionType="RETURNED",    lifeScore=72, price=399.99, originalPrice=599.99, rating=4.2, reviewCount=876,  imageUrl="https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg",            aiVerified=True),
    Product(id=3,  title="WD 2TB Elements Portable External HDD",        description="Compact portable hard drive with USB 3.0 for fast data transfer and large storage capacity",                                category="Electronics",        conditionGrade="A", conditionType="REFURBISHED", lifeScore=93, price=44.99,  originalPrice=64.99,  rating=4.5, reviewCount=3021, imageUrl="https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",            aiVerified=True),
    Product(id=4,  title="SanDisk SSD PLUS 1TB Internal SSD",            description="High-speed internal solid-state drive with up to 535MB/s read speed for faster boot and load times",                       category="Electronics",        conditionGrade="A", conditionType="REFURBISHED", lifeScore=96, price=89.99,  originalPrice=129.99, rating=4.7, reviewCount=1876, imageUrl="https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg",            aiVerified=True),
    Product(id=5,  title="WD 4TB Gaming Drive External HDD",             description="Portable gaming storage compatible with PlayStation and Xbox consoles for expanded game library",                           category="Electronics",        conditionGrade="A", conditionType="REFURBISHED", lifeScore=89, price=74.99,  originalPrice=109.99, rating=4.6, reviewCount=2104, imageUrl="https://fakestoreapi.com/img/61mtL65D4cL._AC_SX679_.jpg",            aiVerified=True),
    Product(id=6,  title="Silicon Power 256GB SSD External Drive",       description="Rugged shockproof portable SSD with USB-C and USB-A compatibility for versatile use",                                      category="Electronics",        conditionGrade="B", conditionType="REFURBISHED", lifeScore=80, price=34.99,  originalPrice=54.99,  rating=4.3, reviewCount=945,  imageUrl="https://fakestoreapi.com/img/71kEqp3aZaL._AC_SX679_.jpg",            aiVerified=True),
    Product(id=7,  title="Mens Casual Slim Fit Premium T-Shirts",        description="Soft cotton slim-fit tee available in multiple colors perfect for casual daily wear",                                       category="Men's Clothing",     conditionGrade="A", conditionType="REFURBISHED", lifeScore=88, price=12.99,  originalPrice=22.99,  rating=4.3, reviewCount=563,  imageUrl="https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg", aiVerified=True),
    Product(id=8,  title="Mens Cotton Jacket",                           description="Warm cotton jacket with zip-front closure ideal for spring and autumn outdoor activities",                                  category="Men's Clothing",     conditionGrade="A", conditionType="RETURNED",    lifeScore=91, price=49.99,  originalPrice=89.99,  rating=4.6, reviewCount=1023, imageUrl="https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",            aiVerified=True),
    Product(id=9,  title="Mens Casual Premium Slim Fit T-Shirts",        description="Premium fabric tee with reinforced stitching and moisture-wicking properties for all-day comfort",                         category="Men's Clothing",     conditionGrade="B", conditionType="REFURBISHED", lifeScore=77, price=14.99,  originalPrice=24.99,  rating=4.4, reviewCount=712,  imageUrl="https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg", aiVerified=True),
    Product(id=10, title="Mens Casual Slim Fit",                         description="Classic slim-fit shirt suitable for casual outings and weekend wear",                                                       category="Men's Clothing",     conditionGrade="C", conditionType="RETURNED",    lifeScore=52, price=15.99,  originalPrice=25.99,  rating=4.1, reviewCount=44,   imageUrl="https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",            aiVerified=False),
    Product(id=11, title="Fjallraven Kanken Mini Backpack",              description="Iconic Swedish backpack with padded shoulder straps and large main compartment for everyday use",                          category="Women's Clothing",   conditionGrade="B", conditionType="RETURNED",    lifeScore=78, price=54.99,  originalPrice=79.99,  rating=4.5, reviewCount=987,  imageUrl="https://fakestoreapi.com/img/81fAn0HKldL._AC_UY879_.jpg",            aiVerified=True),
    Product(id=12, title="Opna Womens Short Sleeve Moisture Tunic",      description="Lightweight moisture-wicking sports tunic with UPF sun protection for outdoor activities",                                 category="Women's Clothing",   conditionGrade="C", conditionType="RETURNED",    lifeScore=55, price=7.99,   originalPrice=12.99,  rating=4.1, reviewCount=321,  imageUrl="https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",            aiVerified=False),
    Product(id=13, title="MBJ Womens Solid Short Sleeve Boat Neck",      description="Classic boat-neck blouse with solid colors and comfortable relaxed fit for office or casual wear",                         category="Women's Clothing",   conditionGrade="B", conditionType="RETURNED",    lifeScore=68, price=9.99,   originalPrice=15.99,  rating=4.0, reviewCount=204,  imageUrl="https://fakestoreapi.com/img/71HblAHs1xL._AC_UY879_-2.jpg",          aiVerified=True),
    Product(id=14, title="Rain Jacket Women Windbreaker Striped",        description="Waterproof striped windbreaker jacket with adjustable hood and packable design for travel",                                category="Women's Clothing",   conditionGrade="C", conditionType="RETURNED",    lifeScore=48, price=29.99,  originalPrice=49.99,  rating=3.9, reviewCount=158,  imageUrl="https://fakestoreapi.com/img/71HblAHs1xL._AC_UY879_-2.jpg",          aiVerified=False),
    Product(id=15, title="Lock and Love Womens Removable Hoodie Jacket", description="Stylish hoodie jacket with removable hood and side pockets for versatile layering",                                        category="Women's Clothing",   conditionGrade="B", conditionType="RETURNED",    lifeScore=75, price=19.99,  originalPrice=34.99,  rating=4.4, reviewCount=674,  imageUrl="https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",            aiVerified=True),
    Product(id=16, title="Womens Short Sleeve V-Neck Slim Tee",          description="Soft V-neck tee with slim-fit cut available in multiple colors for casual everyday style",                                 category="Women's Clothing",   conditionGrade="B", conditionType="REFURBISHED", lifeScore=71, price=11.99,  originalPrice=19.99,  rating=4.3, reviewCount=88,   imageUrl="https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",            aiVerified=True),
    Product(id=17, title="White Gold Diamond Stud Earrings",             description="Elegant 14k white gold earrings with brilliant-cut diamonds in secure push-back settings",                                category="Jewellery",           conditionGrade="A", conditionType="RETURNED",    lifeScore=97, price=299.99, originalPrice=499.99, rating=4.8, reviewCount=412,  imageUrl="https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_FMwebp_QL65_.jpg", aiVerified=True),
    Product(id=18, title="John Hardy Womens Legends Naga Gold Ring",     description="Handcrafted 18k gold ring inspired by the Naga dragon with intricate artisan detailing",                                  category="Jewellery",           conditionGrade="A", conditionType="RETURNED",    lifeScore=98, price=569.99, originalPrice=695.00, rating=4.9, reviewCount=130,  imageUrl="https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg", aiVerified=True),
    Product(id=19, title="Solid Gold Petite Micropave Diamond Ring",     description="Delicate gold ring with micropave diamond setting and polished finish for everyday elegance",                             category="Jewellery",           conditionGrade="A", conditionType="REFURBISHED", lifeScore=95, price=899.99, originalPrice=1100.0, rating=4.8, reviewCount=67,   imageUrl="https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_FMwebp_QL65_.jpg", aiVerified=True),
    Product(id=20, title="Pierced Owl Rose Gold Plated Sterling Studs",  description="Rose gold-plated sterling silver stud earrings with secure screw-back for sensitive ears",                               category="Jewellery",           conditionGrade="B", conditionType="REFURBISHED", lifeScore=74, price=10.99,  originalPrice=18.99,  rating=4.2, reviewCount=389,  imageUrl="https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_FMwebp_QL65_.jpg", aiVerified=False),
]

PRODUCTS_BY_ID: dict[int, Product] = {p.id: p for p in PRODUCTS}

# ── User Profiles ─────────────────────────────────────────────────────────────

USERS: list[UserProfile] = [
    UserProfile(
        userId=1, name="Alice",
        interests=["Electronics", "Women's Clothing"],
        browsingHistory=[1, 2, 11, 13],
        searchHistory=["wireless headphones", "gaming monitor", "hoodie jacket"],
    ),
    UserProfile(
        userId=2, name="Bob",
        interests=["Electronics", "Men's Clothing"],
        browsingHistory=[3, 4, 5, 7, 8],
        searchHistory=["external hard drive", "SSD", "slim fit t-shirt"],
    ),
    UserProfile(
        userId=3, name="Carol",
        interests=["Jewellery", "Women's Clothing"],
        browsingHistory=[17, 18, 11, 15],
        searchHistory=["diamond earrings", "gold ring", "backpack"],
    ),
    UserProfile(
        userId=4, name="David",
        interests=["Men's Clothing"],
        browsingHistory=[7, 9, 10],
        searchHistory=["cotton jacket", "casual shirt", "slim fit"],
    ),
    UserProfile(
        userId=5, name="Eve",
        interests=["Electronics", "Jewellery"],
        browsingHistory=[1, 4, 6, 17, 19],
        searchHistory=["noise cancelling headphones", "SSD drive", "gold ring", "diamond"],
    ),
]

USERS_BY_ID: dict[int, UserProfile] = {u.userId: u for u in USERS}
