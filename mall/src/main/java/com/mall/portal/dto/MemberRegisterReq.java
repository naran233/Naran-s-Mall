package com.mall.portal.dto;

import lombok.Data;

@Data
public class MemberRegisterReq {
    private String username;
    private String password;
    private String nickname;
    private String phone;
}
