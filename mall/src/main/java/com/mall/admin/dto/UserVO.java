package com.mall.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserVO {
    private Long id;
    private String username;
    private String nickName;
    private Integer status;
    private LocalDateTime createTime;
    private List<Long> roleIds;
    private List<String> roleNames;
}
