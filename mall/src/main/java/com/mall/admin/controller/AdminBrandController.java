package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.PmsBrand;
import com.mall.mbg.mapper.PmsBrandMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
public class AdminBrandController {

    @Resource
    private PmsBrandMapper brandMapper;

    @GetMapping
    public R<List<PmsBrand>> list() {
        return R.ok(brandMapper.selectList(new LambdaQueryWrapper<PmsBrand>().orderByAsc(PmsBrand::getSort)));
    }

    @PostMapping
    public R<Void> create(@RequestBody PmsBrand req) {
        if (req.getName() == null) throw new BizException(Code.VALIDATE_FAILED, "品牌名必填");
        if (req.getShowStatus() == null) req.setShowStatus(1);
        brandMapper.insert(req);
        return R.ok("创建成功");
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody PmsBrand req) {
        req.setId(id);
        brandMapper.updateById(req);
        return R.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        brandMapper.deleteById(id);
        return R.ok("删除成功");
    }
}
