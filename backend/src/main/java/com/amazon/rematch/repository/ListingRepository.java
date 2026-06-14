package com.amazon.rematch.repository;

import com.amazon.rematch.entity.Listing;
import com.amazon.rematch.entity.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    List<Listing> findAllByOrderBySubmittedAtDesc();

    List<Listing> findByStatusOrderBySubmittedAtDesc(ListingStatus status);

    List<Listing> findBySellerIdOrderBySubmittedAtDesc(String sellerId);

    List<Listing> findByStatusAndSellerIdOrderBySubmittedAtDesc(ListingStatus status, String sellerId);
}
