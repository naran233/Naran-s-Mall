package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.portal.dto.CategoryNode;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.PmsProductCategory;
import com.mall.mbg.mapper.PmsProductCategoryMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/productCategories")
public class AdminProductCategoryController {

    @Resource
    private PmsProductCategoryMapper categoryMapper;

    @GetMapping("/tree")
    public R<List<CategoryNode>> tree() {
        // 按 sort 排序输出，避免分类顺序随 HashMap 遍历顺序变化
        List<PmsProductCategory> all = categoryMapper.selectList(new LambdaQueryWrapper<PmsProductCategory>()
                .orderByAsc(PmsProductCategory::getSort)
                .orderByAsc(PmsProductCategory::getId));
        Map<Long, CategoryNode> map = all.stream().map(c -> {
            CategoryNode n = new CategoryNode();
            n.setId(c.getId());
            n.setParentId(c.getParentId());
            n.setName(c.getName());
            n.setLevel(c.getLevel());
            n.setSort(c.getSort());
            n.setIcon(c.getIcon());
            return n;
        }).collect(Collectors.toMap(CategoryNode::getId, n -> n, (a, b) -> a, LinkedHashMap::new));
        List<CategoryNode> roots = new ArrayList<>();
        for (CategoryNode n : map.values()) {
            Long pid = n.getParentId() == null ? 0L : n.getParentId();
            if (pid == 0L) roots.add(n);
            else {
                CategoryNode parent = map.get(pid);
                if (parent != null) {
                    if (parent.getChildren() == null) parent.setChildren(new ArrayList<>());
                    parent.getChildren().add(n);
                } else roots.add(n);
            }
        }
        Comparator<CategoryNode> bySort = Comparator.comparingInt(n -> n.getSort() == null ? 0 : n.getSort());
        roots.sort(bySort);
        map.values().forEach(n -> {
            if (n.getChildren() != null) n.getChildren().sort(bySort);
        });
        return R.ok(roots);
    }

    @PostMapping
    public R<Void> create(@RequestBody PmsProductCategory req) {
        if (req.getName() == null) throw new BizException(Code.VALIDATE_FAILED, "分类名必填");
        if (req.getParentId() == null) req.setParentId(0L);
        if (req.getLevel() == null) req.setLevel(req.getParentId() == 0L ? 0 : 1);
        categoryMapper.insert(req);
        return R.ok("创建成功");
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody PmsProductCategory req) {
        req.setId(id);
        categoryMapper.updateById(req);
        return R.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        categoryMapper.delete(new LambdaQueryWrapper<PmsProductCategory>().eq(PmsProductCategory::getParentId, id));
        categoryMapper.deleteById(id);
        return R.ok("删除成功");
    }
}
