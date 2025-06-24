package com.CodeReviewApp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CodeReviewApp.model.Role;
import com.CodeReviewApp.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	List<User> findByRoleIn(List<Role> roles);
    Optional<User> findByEmail(String email);
    void deleteById(Long id);
    void deleteByEmail(String email);
    Optional<User> findById(Long id);
    
}
