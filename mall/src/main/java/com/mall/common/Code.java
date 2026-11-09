package com.mall.common;

public enum Code {
    SUCCESS(200, "success"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "没有访问权限"),
    VALIDATE_FAILED(404, "参数校验失败"),
    BUSINESS_FAILED(500, "业务处理失败"),
    ERROR(500, "系统异常");

    private final int code;
    private final String message;

    Code(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }
}
