package com.mall.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private long adminExpiration;
    @Value("${jwt.member-expiration}")
    private long memberExpiration;
    @Value("${jwt.header}")
    private String header;
    @Value("${jwt.token-prefix}")
    private String tokenPrefix;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String subject, Long uid, String type, List<String> roles, boolean isAdmin) {
        long ttl = isAdmin ? adminExpiration : memberExpiration;
        return Jwts.builder()
                .subject(subject)
                .claim("uid", uid)
                .claim("type", type)
                .claim("roles", String.join(",", roles == null ? List.of() : roles))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ttl * 1000))
                .signWith(key())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
    }

    public String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith(tokenPrefix)) {
            return null;
        }
        return authHeader.substring(tokenPrefix.length());
    }

    public String getHeader() {
        return header;
    }
}
