package com.CodeReviewApp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CodeReviewApp.model.CodeSubmission;
import com.CodeReviewApp.model.ReviewResult;

@Repository
public interface ReviewResultRepository extends JpaRepository<ReviewResult, Long> {
    Optional<ReviewResult> findBySubmission(CodeSubmission submission);
}
