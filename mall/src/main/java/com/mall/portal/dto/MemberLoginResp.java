package com.mall.portal.dto;

import lombok.Data;

@Data
public class MemberLoginResp {
    private String token;
    private Long memberId;
    private String username;
    private String nickname;
}
