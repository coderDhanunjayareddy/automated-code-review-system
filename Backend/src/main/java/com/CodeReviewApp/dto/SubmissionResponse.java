package com.CodeReviewApp.dto;

public class SubmissionResponse {
    private String message;
    public SubmissionResponse(String m){ this.message = m; }
    public String getMessage(){ return message; }
}

