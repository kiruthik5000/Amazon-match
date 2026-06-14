package com.amazon.rematch.service;

import com.amazon.rematch.entity.GreenCredit;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BadgeService {

    public record Badge(String id, String name, String icon, String description, boolean earned) {}

    private static final List<BadgeDefinition> DEFINITIONS = List.of(
        new BadgeDefinition("first_match",    "First ReMatch",    "♻️",  "Complete your first ReMatch purchase",                    gc -> gc.getItemsRematched() >= 1),
        new BadgeDefinition("eco_starter",    "Eco Starter",      "🌱",  "Save 1 kg of CO₂",                                       gc -> gc.getCo2SavedKg() >= 1.0),
        new BadgeDefinition("green_five",     "Green Five",       "🌿",  "Purchase 5 ReMatch products",                             gc -> gc.getItemsRematched() >= 5),
        new BadgeDefinition("credit_100",     "Century Saver",    "💯",  "Earn 100 Green Credits",                                  gc -> gc.getTotalCredits() >= 100),
        new BadgeDefinition("co2_ten",        "CO₂ Fighter",      "🌍",  "Save 10 kg of CO₂",                                      gc -> gc.getCo2SavedKg() >= 10.0),
        new BadgeDefinition("green_ten",      "Green Decade",     "🍀",  "Purchase 10 ReMatch products",                            gc -> gc.getItemsRematched() >= 10),
        new BadgeDefinition("credit_500",     "Half Grand",       "⭐",  "Earn 500 Green Credits",                                  gc -> gc.getTotalCredits() >= 500),
        new BadgeDefinition("co2_fifty",      "Planet Champion",  "🌳",  "Save 50 kg of CO₂",                                      gc -> gc.getCo2SavedKg() >= 50.0),
        new BadgeDefinition("green_fifty",    "ReMatch Legend",   "🏆",  "Purchase 50 ReMatch products",                            gc -> gc.getItemsRematched() >= 50),
        new BadgeDefinition("credit_1000",    "Green Millionaire","💎",  "Earn 1,000 Green Credits",                                gc -> gc.getTotalCredits() >= 1000)
    );

    public List<Badge> computeBadges(GreenCredit gc) {
        List<Badge> badges = new ArrayList<>();
        for (BadgeDefinition def : DEFINITIONS) {
            badges.add(new Badge(
                def.id(), def.name(), def.icon(), def.description(),
                def.predicate().test(gc)
            ));
        }
        return badges;
    }

    public long countEarned(GreenCredit gc) {
        return DEFINITIONS.stream().filter(d -> d.predicate().test(gc)).count();
    }

    private record BadgeDefinition(
        String id, String name, String icon, String description,
        java.util.function.Predicate<GreenCredit> predicate
    ) {}
}
