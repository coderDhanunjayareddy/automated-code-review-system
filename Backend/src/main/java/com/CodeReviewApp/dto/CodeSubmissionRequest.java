package com.CodeReviewApp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeSubmissionRequest {
    private String email;      // to fetch User
    private String language;
    private String submittedCode;

    // Getters and Setters
}

