package com.mall.security;

import com.mall.common.BizException;
import com.mall.common.Code;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

public class AuthUtil {

    public static LoginUser current() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof LoginUser lu) {
            return lu;
        }
        return null;
    }

    public static Long adminId() {
        LoginUser u = current();
        if (u == null || !"ADMIN".equals(u.getType())) {
            throw new BizException(Code.UNAUTHORIZED, "管理员未登录");
        }
        return u.getId();
    }

    public static Long memberId() {
        LoginUser u = current();
        if (u == null || !"MEMBER".equals(u.getType())) {
            throw new BizException(Code.UNAUTHORIZED, "会员未登录");
        }
        return u.getId();
    }

    public static boolean hasRole(String role) {
        LoginUser u = current();
        if (u == null || u.getRoles() == null) return false;
        return u.getRoles().contains(role);
    }

    public static List<String> roles() {
        LoginUser u = current();
        return u == null ? List.of() : u.getRoles();
    }
}
