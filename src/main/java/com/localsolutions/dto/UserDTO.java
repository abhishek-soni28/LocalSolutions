package com.localsolutions.dto;

import com.localsolutions.model.User;
import com.localsolutions.model.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String pincode;
    private UserRole role;
    private LocalDateTime createdAt;

    // Business owner fields
    private String shopName;
    private String businessCategory;
    private String serviceArea;
    private boolean offersOnDemandProducts;

    public static UserDTO fromUser(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setMobileNumber(user.getMobileNumber());
        dto.setPincode(user.getPincode());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getRole() == UserRole.BUSINESS_OWNER) {
            dto.setShopName(user.getShopName());
            dto.setBusinessCategory(user.getBusinessCategory());
            dto.setServiceArea(user.getServiceArea());
            dto.setOffersOnDemandProducts(user.isOffersOnDemandProducts());
        }

        return dto;
    }
}
