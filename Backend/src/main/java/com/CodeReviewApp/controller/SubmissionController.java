package com.CodeReviewApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;

import com.CodeReviewApp.dto.CodeSubmissionRequest;
import com.CodeReviewApp.dto.SubmissionResponse;
import com.CodeReviewApp.model.CodeSubmission;
import com.CodeReviewApp.model.ReviewResult;
import com.CodeReviewApp.model.User;
import com.CodeReviewApp.repository.UserRepository;
import com.CodeReviewApp.service.MyUserDetailsService;
import com.CodeReviewApp.service.ReviewService;
import com.CodeReviewApp.service.SubmissionService;

@RestController
@PreAuthorize("hasRole('DEVELOPER')")
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;
    
    @Autowired 
    private UserRepository userRepo;
    
    @Autowired
    private MyUserDetailsService userService;
    
    @Autowired 
    private ReviewService reviewService;
    
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
    
    @PostMapping("/upload/body")
    public ResponseEntity<SubmissionResponse> uploadCode(@RequestBody CodeSubmissionRequest request) {

        if (request.getSubmittedCode() == null || request.getSubmittedCode().trim().isEmpty()) {
        	return ResponseEntity.badRequest()
                    .body(new SubmissionResponse("Code must not be empty."));
        }
        CodeSubmission saved = submissionService.saveSubmission(request);
        String msg = "Code saved with ID " + saved.getId() + ". You can review it later.";
        return ResponseEntity.ok(new SubmissionResponse(msg));
    }
    
    @PostMapping("/upload/file")
    public ResponseEntity<SubmissionResponse> uploadCodeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", defaultValue = "Java") String language
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new SubmissionResponse("Uploaded file is empty."));
            }
            
            // 🔑 Extract logged-in user from token
            String email = getCurrentUserEmail();
            User user = userService.getUserByEmail(email);  // ✅ Use your existing method
            Long userId = user.getId();

            String fileContent = new String(file.getBytes());

            CodeSubmission saved = submissionService.saveSubmission(fileContent, userId, language);
            String msg = "Code saved with ID " + saved.getId() + ". You can review it later.";
            return ResponseEntity.ok(new SubmissionResponse(msg));

        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .body(new SubmissionResponse("Error: " + ex.getMessage()));
        }
    }
    
    @PostMapping("/upload/zip")
    public ResponseEntity<SubmissionResponse> uploadZip(@RequestParam("file") MultipartFile file) {
        try {
            if (!file.getOriginalFilename().endsWith(".zip")) {
                return ResponseEntity.badRequest()
                        .body(new SubmissionResponse("Only .zip files are supported."));
            }
            
         // 🔑 Extract logged-in user from token
            String email = getCurrentUserEmail();
            User user = userService.getUserByEmail(email);  // ✅ Use your existing method
            Long userId = user.getId();
            
            CodeSubmission saved = submissionService.saveZip(file, userId);   // ⬅️ new method
            return ResponseEntity.ok(
                    new SubmissionResponse("Zip saved with ID " + saved.getId() +
                            ". Run /api/review/run/" + saved.getId() + " to analyze."));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new SubmissionResponse("Error processing zip: " + e.getMessage()));
        }
    }
    
    @GetMapping("/getAllCodeSub")
    public ResponseEntity<List<CodeSubmission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }
    
    @GetMapping("/getCodeSubById/{id}")
    public ResponseEntity<CodeSubmission> getSubmissionById(@PathVariable Long id) {
        CodeSubmission submission = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(submission);
    }
    
    @DeleteMapping("/deleteCodeSubById/{id}")
    public ResponseEntity<String> deleteSubmissionById(@PathVariable Long id) {
        submissionService.deleteSubmissionById(id);
        return ResponseEntity.ok("Submission with ID " + id + " deleted successfully.");
    }
    
    @GetMapping("/{id}")
    public ReviewResult getReviewById(@PathVariable Long id) {
        return reviewService.getReviewById(id);
    }

}

