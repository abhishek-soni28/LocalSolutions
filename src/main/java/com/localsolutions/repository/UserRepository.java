package com.localsolutions.repository;

import com.localsolutions.model.User;
import com.localsolutions.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByMobileNumber(String mobileNumber);
    List<User> findByRole(UserRole role);
    List<User> findByPincode(String pincode);
    List<User> findByRoleAndShopNameIsNotNull(UserRole role);
    List<User> findByBusinessCategoryAndPincode(String category, String pincode);
    boolean existsByUsername(String username);
    boolean existsByMobileNumber(String mobileNumber);
} 