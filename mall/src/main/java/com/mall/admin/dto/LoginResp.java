package com.mall.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class LoginResp {
    private String token;
    private String username;
    private String nickName;
    private List<String> roles;
    private List<MenuNode> menus;
}
