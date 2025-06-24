package com.CodeReviewApp.controller;

import com.CodeReviewApp.model.User;
import com.CodeReviewApp.service.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users") 
@PreAuthorize("hasRole('ADMIN')")	// Only ADMIN can access these endpoints
public class UserController {

    @Autowired
    private MyUserDetailsService userService;

    // 1. Get all developers and testers
    @GetMapping("/getAllemp")
    public ResponseEntity<List<User>> getAllEmployees() {
        List<User> users = userService.getAllEmployees();
        return ResponseEntity.ok(users);
    }

    // 2. Get user by ID
    @GetMapping("/getById/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // 3. Get user by Email
    @GetMapping("/getByemail/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    // 4. Delete user by ID
    @DeleteMapping("/deleteById/{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
