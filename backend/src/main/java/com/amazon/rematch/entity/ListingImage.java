package com.amazon.rematch.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "listing_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ListingImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(nullable = false)
    private String imageUrl;

    // display order — first image (0) is the cover
    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;
}
