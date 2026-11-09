package com.mall.common;

import lombok.Getter;

@Getter
public class BizException extends RuntimeException {
    private final int code;

    public BizException(String message) {
        super(message);
        this.code = Code.BUSINESS_FAILED.getCode();
    }

    public BizException(Code code, String message) {
        super(message);
        this.code = code.getCode();
    }

    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }
}
