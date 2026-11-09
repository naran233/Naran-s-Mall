package com.mall.common;

import lombok.Data;

import java.io.Serializable;

@Data
public class R<T> implements Serializable {
    private int code;
    private String message;
    private T data;

    public R() {}

    public R(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> R<T> ok() {
        return new R<>(Code.SUCCESS.getCode(), Code.SUCCESS.getMessage(), null);
    }

    public static R<Void> ok(String message) {
        return new R<>(Code.SUCCESS.getCode(), message, null);
    }

    public static <T> R<T> ok(T data) {
        return new R<>(Code.SUCCESS.getCode(), Code.SUCCESS.getMessage(), data);
    }

    public static <T> R<T> ok(String message, T data) {
        return new R<>(Code.SUCCESS.getCode(), message, data);
    }

    public static <T> R<T> fail(Code code) {
        return new R<>(code.getCode(), code.getMessage(), null);
    }

    public static <T> R<T> fail(Code code, String message) {
        return new R<>(code.getCode(), message, null);
    }

    public static <T> R<T> fail(int code, String message) {
        return new R<>(code, message, null);
    }
}
