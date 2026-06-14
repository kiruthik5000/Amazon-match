package com.amazon.rematch.config;

import com.amazon.rematch.entity.*;
import com.amazon.rematch.entity.Product.ConditionGrade;
import com.amazon.rematch.entity.Product.ConditionType;
import com.amazon.rematch.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository     productRepository;
    private final UserRepository        userRepository;
    private final RecommendationRepository recommendationRepository;
    private final UserInterestRepository   userInterestRepository;
    private final PasswordEncoder          passwordEncoder;

    @Override
    public void run(String... args) {
        seedProducts();
        seedUsers();
        log.info("DataSeeder: seeding complete.");
    }

    // ── Products ──────────────────────────────────────────────────────────────

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        String base = "http://localhost:8080/uploads/";

        List<Product> products = List.of(

            // ── Refurbished (10) ─────────────────────────────────────────────
            product("Oppo A17 Smartphone (Refurbished)",
                "Refurbished Oppo A17, 4GB RAM, 64GB storage. Battery health 92%. Includes charger.",
                15999, 9999, "Electronics", base + "oppo-a17.jpeg",
                4.2, 1234, ConditionType.REFURBISHED, ConditionGrade.A, 88, true,
                "AI verified: Minor screen scratches, fully functional.",
                28.6139, 77.2090, "New Delhi", "Delhi", "India"),

            product("POCO M4 Pro 5G (Refurbished)",
                "Certified refurbished POCO M4 Pro 5G, 6GB RAM, 128GB. Excellent battery life.",
                18999, 12999, "Electronics", base + "poco-phone.jpeg",
                4.4, 987, ConditionType.REFURBISHED, ConditionGrade.A, 91, true,
                "AI verified: Grade A. No visible wear. All sensors working.",
                28.6139, 77.2090, "New Delhi", "Delhi", "India"),

            product("Samsung Galaxy M21 (Refurbished)",
                "Refurbished Samsung M21, 6000mAh battery, 6GB RAM. Perfect for everyday use.",
                16999, 10499, "Electronics", base + "samsung-m21.jpeg",
                4.3, 2105, ConditionType.REFURBISHED, ConditionGrade.B, 82, true,
                "AI verified: Grade B. Minor back panel wear, screen pristine.",
                19.0760, 72.8777, "Mumbai", "Maharashtra", "India"),

            product("Panasonic Trimmer ER-GB40 (Refurbished)",
                "Refurbished Panasonic beard trimmer. Cleaned, blade sharpened, fully tested.",
                2495, 1199, "Personal Care", base + "panasonic-trimmer.jpeg",
                4.1, 678, ConditionType.REFURBISHED, ConditionGrade.B, 78, false,
                null,
                12.9716, 77.5946, "Bengaluru", "Karnataka", "India"),

            product("HP 15s Laptop Intel i5 (Refurbished)",
                "Refurbished HP 15s, Intel i5-11th Gen, 8GB RAM, 512GB SSD. Ready to use.",
                65000, 42999, "Electronics", base + "hp-laptop.jpeg",
                4.5, 892, ConditionType.REFURBISHED, ConditionGrade.A, 87, true,
                "AI verified: Grade A. No scratches. Battery holds 4hrs+.",
                22.5726, 88.3639, "Kolkata", "West Bengal", "India"),

            product("Genuine Leather Belt (Refurbished)",
                "Lightly used genuine leather belt, size 34. Polished and conditioned.",
                1499, 599, "Fashion", base + "belt.jpeg",
                4.0, 312, ConditionType.REFURBISHED, ConditionGrade.B, 72, false,
                null,
                13.0827, 80.2707, "Chennai", "Tamil Nadu", "India"),

            product("Fastrack Analog Watch (Refurbished)",
                "Refurbished Fastrack watch. Strap replaced, mechanism serviced.",
                2995, 1499, "Jewellery", base + "fastrack-watch.jpeg",
                4.3, 567, ConditionType.REFURBISHED, ConditionGrade.A, 85, true,
                "AI verified: Crystal clear dial, strap new.",
                17.3850, 78.4867, "Hyderabad", "Telangana", "India"),

            product("Over-Ear Headphone (Refurbished)",
                "Refurbished wired over-ear headphone. Deep bass, 3.5mm jack. Ear pads replaced.",
                3990, 1799, "Electronics", base + "headphone.jpeg",
                4.2, 1034, ConditionType.REFURBISHED, ConditionGrade.B, 76, false,
                null,
                18.5204, 73.8567, "Pune", "Maharashtra", "India"),

            product("Q&Q Analog Wrist Watch (Refurbished)",
                "Refurbished Q&Q quartz watch. Water resistant, date display. Battery new.",
                1299, 649, "Jewellery", base + "qq-watch.jpeg",
                4.1, 445, ConditionType.REFURBISHED, ConditionGrade.A, 83, false,
                null,
                23.0225, 72.5714, "Ahmedabad", "Gujarat", "India"),

            product("Stainless Steel Water Bottle 1L (Refurbished)",
                "Refurbished stainless steel insulated bottle. Deep cleaned, leak tested.",
                999, 449, "Sports", base + "water-bottle.jpeg",
                4.4, 789, ConditionType.REFURBISHED, ConditionGrade.A, 90, false,
                null,
                26.9124, 75.7873, "Jaipur", "Rajasthan", "India"),

            // ── Returned (10) ────────────────────────────────────────────────
            product("Oppo A17 Smartphone (Returned)",
                "Returned within 3 days — customer upgraded. No scratches, includes box.",
                15999, 13499, "Electronics", base + "oppo-a17.jpeg",
                4.2, 543, ConditionType.RETURNED, ConditionGrade.A, 97, true,
                "AI verified: Mint condition. Screen protector intact.",
                28.6139, 77.2090, "New Delhi", "Delhi", "India"),

            product("POCO M4 Pro 5G (Returned)",
                "Returned unopened. Original seal intact. Full warranty valid.",
                18999, 16499, "Electronics", base + "poco-phone.jpeg",
                4.4, 321, ConditionType.RETURNED, ConditionGrade.A, 99, true,
                "AI verified: Sealed box confirmed.",
                19.0760, 72.8777, "Mumbai", "Maharashtra", "India"),

            product("Samsung Galaxy M21 (Returned)",
                "Returned after 5 days — wrong colour. Used minimally, all accessories present.",
                16999, 14299, "Electronics", base + "samsung-m21.jpeg",
                4.3, 876, ConditionType.RETURNED, ConditionGrade.A, 95, true,
                "AI verified: Grade A. No signs of heavy use.",
                12.9716, 77.5946, "Bengaluru", "Karnataka", "India"),

            product("Panasonic Trimmer ER-GB40 (Returned)",
                "Returned — gifted duplicate. Never used, original packaging.",
                2495, 2099, "Personal Care", base + "panasonic-trimmer.jpeg",
                4.1, 234, ConditionType.RETURNED, ConditionGrade.A, 99, false,
                null,
                22.5726, 88.3639, "Kolkata", "West Bengal", "India"),

            product("HP 15s Laptop Intel i5 (Returned)",
                "Returned within 7 days — bought wrong config. Barely used.",
                65000, 57999, "Electronics", base + "hp-laptop.jpeg",
                4.5, 189, ConditionType.RETURNED, ConditionGrade.A, 98, true,
                "AI verified: Like new. No wear on keyboard.",
                13.0827, 80.2707, "Chennai", "Tamil Nadu", "India"),

            product("Genuine Leather Belt (Returned)",
                "Returned same day — wrong size. Tags still attached.",
                1499, 1199, "Fashion", base + "belt.jpeg",
                4.0, 98, ConditionType.RETURNED, ConditionGrade.A, 99, false,
                null,
                17.3850, 78.4867, "Hyderabad", "Telangana", "India"),

            product("Fastrack Analog Watch (Returned)",
                "Returned within 2 days — received as gift, already had one.",
                2995, 2499, "Jewellery", base + "fastrack-watch.jpeg",
                4.3, 167, ConditionType.RETURNED, ConditionGrade.A, 97, false,
                null,
                23.0225, 72.5714, "Ahmedabad", "Gujarat", "India"),

            product("Over-Ear Headphone (Returned)",
                "Returned — customer preferred earbuds. Used once for 30 mins.",
                3990, 3299, "Electronics", base + "headphone.jpeg",
                4.2, 412, ConditionType.RETURNED, ConditionGrade.A, 96, true,
                "AI verified: No wear. Ear pads perfect.",
                18.5204, 73.8567, "Pune", "Maharashtra", "India"),

            product("Q&Q Analog Wrist Watch (Returned)",
                "Returned within 24 hours — strap colour mismatch. Unworn.",
                1299, 1049, "Jewellery", base + "qq-watch.jpeg",
                4.1, 88, ConditionType.RETURNED, ConditionGrade.A, 99, false,
                null,
                26.9124, 75.7873, "Jaipur", "Rajasthan", "India"),

            product("Stainless Steel Water Bottle 1L (Returned)",
                "Returned — wrong capacity ordered. Brand new, never filled.",
                999, 849, "Sports", base + "water-bottle.jpeg",
                4.4, 321, ConditionType.RETURNED, ConditionGrade.A, 99, false,
                null,
                28.6139, 77.2090, "New Delhi", "Delhi", "India")
        );

        productRepository.saveAll(products);
        log.info("DataSeeder: saved {} products.", products.size());
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    private void seedUsers() {
        // User 1 — Delhi (Account A)
        if (userRepository.findByEmail("alice@rematch.in").isEmpty()) {
            User alice = new User();
            alice.setName("Alice Sharma");
            alice.setEmail("alice@rematch.in");
            alice.setPassword(passwordEncoder.encode("password123"));
            alice.setRole(Role.USER);
            alice.setCity("New Delhi");
            alice.setState("Delhi");
            alice.setCountry("India");
            alice.setLatitude(28.6139);
            alice.setLongitude(77.2090);
            userRepository.save(alice);
            log.info("DataSeeder: created user alice@rematch.in (Delhi)");
        }

        // User 2 — Mumbai (Account B — different location, ~1400 km from Delhi)
        if (userRepository.findByEmail("bob@rematch.in").isEmpty()) {
            User bob = new User();
            bob.setName("Bob Patel");
            bob.setEmail("bob@rematch.in");
            bob.setPassword(passwordEncoder.encode("password123"));
            bob.setRole(Role.USER);
            bob.setCity("Mumbai");
            bob.setState("Maharashtra");
            bob.setCountry("India");
            bob.setLatitude(19.0760);
            bob.setLongitude(72.8777);
            userRepository.save(bob);
            log.info("DataSeeder: created user bob@rematch.in (Mumbai)");
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Product product(
            String title, String desc,
            double origPrice, double rematchPrice,
            String category, String imageUrl,
            double rating, int reviewCount,
            ConditionType conditionType, ConditionGrade conditionGrade,
            int lifeScore, boolean aiVerified, String aiSummary,
            double lat, double lon, String city, String state, String country) {

        Product p = new Product();
        p.setTitle(title);
        p.setDescription(desc);
        p.setOriginalPrice(BigDecimal.valueOf(origPrice));
        p.setRematchPrice(BigDecimal.valueOf(rematchPrice));
        p.setCategory(category);
        p.setImageUrl(imageUrl);
        p.setRating(BigDecimal.valueOf(rating));
        p.setReviewCount(reviewCount);
        p.setConditionType(conditionType);
        p.setConditionGrade(conditionGrade);
        p.setLifeScore(lifeScore);
        p.setAiVerified(aiVerified);
        p.setAiAssessmentSummary(aiSummary);
        p.setAvailable(true);
        p.setLatitude(lat);
        p.setLongitude(lon);
        p.setCity(city);
        p.setState(state);
        p.setCountry(country);
        return p;
    }
}
