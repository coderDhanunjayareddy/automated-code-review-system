package com.CodeReviewApp.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.CodeReviewApp.dto.CodeSubmissionRequest;
import com.CodeReviewApp.model.CodeSubmission;
import com.CodeReviewApp.model.ReviewResult;
import com.CodeReviewApp.model.User;
import com.CodeReviewApp.repository.SubmissionRepository;
import com.CodeReviewApp.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


@Service
public class SubmissionService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private SubmissionRepository submissionRepo;
    
    @Autowired
    private ReviewService reviewService;

    
    
    /** Saves the code and returns the persisted entity.  No review is run here. */
    public CodeSubmission saveSubmission(CodeSubmissionRequest req) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email  = auth.getName();                                // from JWT
        User user     = userRepo.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

        CodeSubmission sub = new CodeSubmission();
        sub.setUser(user);
        sub.setLanguage(req.getLanguage());
        sub.setSubmittedCode(req.getSubmittedCode());
        sub.setSubmittedDate(LocalDateTime.now());

        return submissionRepo.save(sub);                               // <- only save
    }


    public CodeSubmission saveSubmission(String fileContent, Long userId, String language) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CodeSubmission submission = new CodeSubmission();
        submission.setLanguage(language);
        submission.setSubmittedCode(fileContent);
        submission.setSubmittedDate(LocalDateTime.now());
        submission.setUser(user);

        return submissionRepo.save(submission);
    }
    
    public CodeSubmission saveZip(MultipartFile zipFile, Long userId) throws IOException {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CodeSubmission sub = new CodeSubmission();
        sub.setUser(user);
        sub.setLanguage("ZIP");                      // flag so ReviewController knows
        sub.setSubmittedCode(Base64.getEncoder()
                                   .encodeToString(zipFile.getBytes())); // store bytes
        sub.setSubmittedDate(LocalDateTime.now());

        return submissionRepo.save(sub);
    }
    public List<CodeSubmission> getAllSubmissions() {
        return submissionRepo.findAll();
    }
    public CodeSubmission getSubmissionById(Long id) {
        return submissionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found with ID: " + id));
    }
    public void deleteSubmissionById(Long id) {
        if (!submissionRepo.existsById(id)) {
            throw new RuntimeException("Submission not found with ID: " + id);
        }
        submissionRepo.deleteById(id);
    }

  }	
	

