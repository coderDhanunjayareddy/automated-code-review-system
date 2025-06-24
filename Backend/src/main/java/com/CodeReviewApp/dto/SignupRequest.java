package com.CodeReviewApp.dto;

import com.CodeReviewApp.model.Role;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
	 	private String name;
	    private String email;
	    private String password;
	    
	    @Enumerated(EnumType.STRING)
	    private Role role;

}
