package com.mall.common;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public R<Void> handleBiz(BizException e) {
        return R.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler({AuthenticationException.class})
    public R<Void> handleAuth(AuthenticationException e) {
        return R.fail(Code.UNAUTHORIZED, e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public R<Void> handleAccess(AccessDeniedException e) {
        return R.fail(Code.FORBIDDEN, "没有访问权限");
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public R<Void> handleValid(Exception e) {
        String msg = "参数校验失败";
        if (e instanceof MethodArgumentNotValidException m) {
            FieldError fe = m.getBindingResult().getFieldError();
            if (fe != null) msg = fe.getDefaultMessage();
        } else if (e instanceof BindException b) {
            FieldError fe = b.getBindingResult().getFieldError();
            if (fe != null) msg = fe.getDefaultMessage();
        }
        return R.fail(Code.VALIDATE_FAILED, msg);
    }

    @ExceptionHandler(Exception.class)
    public R<Void> handleOther(Exception e, HttpServletRequest request) {
        return R.fail(Code.ERROR, e.getMessage() == null ? "系统异常" : e.getMessage());
    }
}
