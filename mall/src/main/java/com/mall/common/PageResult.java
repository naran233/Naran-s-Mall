package com.mall.common;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageResult<T> implements Serializable {
    private long total;
    private long pageSize;
    private long pageNum;
    private long totalPage;
    private List<T> list;

    public static <T> PageResult<T> of(List<T> list, long total, long pageNum, long pageSize) {
        PageResult<T> r = new PageResult<>();
        r.setList(list);
        r.setTotal(total);
        r.setPageNum(pageNum);
        r.setPageSize(pageSize);
        r.setTotalPage(pageSize == 0 ? 0 : (total + pageSize - 1) / pageSize);
        return r;
    }
}
