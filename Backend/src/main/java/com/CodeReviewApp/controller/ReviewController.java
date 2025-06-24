package com.CodeReviewApp.controller;

import com.CodeReviewApp.model.CodeSubmission;
import com.CodeReviewApp.model.ReviewResult;
import com.CodeReviewApp.repository.SubmissionRepository;
import com.CodeReviewApp.repository.ReviewResultRepository;
import com.CodeReviewApp.service.ReviewService;
import com.CodeReviewApp.service.SubmissionService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@PreAuthorize("hasRole('TESTER')")
@RequestMapping("/api/review")
public class ReviewController {

    @Autowired 
    private ReviewService reviewService;
    
    @Autowired 
    private SubmissionRepository submissionRepo;
   
    @Autowired 
    private ReviewResultRepository reviewRepo;
    
    @Autowired 
    private SubmissionService submissionServ;
    
    @GetMapping("/submissions")
    public ResponseEntity<List<CodeSubmission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionServ.getAllSubmissions());
    }

    /* ---- 1. Trigger a fresh PMD review ---- */
    @PostMapping("/run/{submissionId}")
    public ReviewResult runReview(@PathVariable Long submissionId) {

        CodeSubmission sub = submissionRepo.findById(submissionId)
                            .orElseThrow(() -> new RuntimeException("Submission not found"));
        try {
            String lang = sub.getLanguage();
            if ("ZIP".equalsIgnoreCase(lang)) {
                return reviewService.analyzeZip(sub);
            } else {
                return reviewService.analyzeSnippet(sub);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error during review: " + e.getMessage());
        }           // returns new ReviewResult
    }
    
    @GetMapping("/getAllReviews")
    public ResponseEntity<List<ReviewResult>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
    
    @GetMapping("/{id}")
    public ReviewResult getReviewById(@PathVariable Long id) {
        return reviewService.getReviewById(id);
    }

}
