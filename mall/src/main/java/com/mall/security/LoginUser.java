package com.mall.security;

import lombok.Data;

import java.util.List;

@Data
public class LoginUser {
    private Long id;
    private String username;
    private String type;     // ADMIN / MEMBER
    private List<String> roles;
}
