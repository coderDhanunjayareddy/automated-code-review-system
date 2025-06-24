package com.CodeReviewApp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CodeReviewApp.model.CodeSubmission;
import com.CodeReviewApp.model.ReviewResult;
import com.CodeReviewApp.model.User;

@Repository
public interface SubmissionRepository extends JpaRepository<CodeSubmission, Long> {
    List<CodeSubmission> findByUser(User user);
    List<CodeSubmission> findAll();

}
