package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.PageResult;
import com.mall.common.R;
import com.mall.mbg.entity.CmsHelp;
import com.mall.mbg.entity.CmsHelpCategory;
import com.mall.mbg.mapper.CmsHelpCategoryMapper;
import com.mall.mbg.mapper.CmsHelpMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 帮助中心（后台）：分类与文章管理
 */
@RestController
@RequestMapping("/api/admin")
public class AdminHelpController {

    @Resource
    private CmsHelpCategoryMapper categoryMapper;
    @Resource
    private CmsHelpMapper helpMapper;

    // ---------------- 分类 ----------------
    @GetMapping("/helpCategories")
    public R<List<CmsHelpCategory>> categories() {
        return R.ok(categoryMapper.selectList(new LambdaQueryWrapper<CmsHelpCategory>().orderByAsc(CmsHelpCategory::getSort)));
    }

    @PostMapping("/helpCategories")
    public R<Void> createCategory(@RequestBody CmsHelpCategory c) {
        c.setId(null);
        if (c.getCreateTime() == null) c.setCreateTime(LocalDateTime.now());
        if (c.getShowStatus() == null) c.setShowStatus(1);
        if (c.getSort() == null) c.setSort(0);
        categoryMapper.insert(c);
        return R.ok("新增成功");
    }

    @PutMapping("/helpCategories/{id}")
    public R<Void> updateCategory(@PathVariable Long id, @RequestBody CmsHelpCategory c) {
        c.setId(id);
        categoryMapper.updateById(c);
        return R.ok("保存成功");
    }

    @DeleteMapping("/helpCategories/{id}")
    public R<Void> deleteCategory(@PathVariable Long id) {
        Long used = helpMapper.selectCount(new LambdaQueryWrapper<CmsHelp>().eq(CmsHelp::getCategoryId, id));
        if (used != null && used > 0) throw new BizException(Code.BUSINESS_FAILED, "该分类下还有文章，无法删除");
        categoryMapper.deleteById(id);
        return R.ok("删除成功");
    }

    // ---------------- 文章 ----------------
    @GetMapping("/helps")
    public R<PageResult<CmsHelp>> list(@RequestParam(required = false) Long categoryId,
                                       @RequestParam(required = false) String keyword,
                                       @RequestParam(defaultValue = "1") long pageNum,
                                       @RequestParam(defaultValue = "10") long pageSize) {
        LambdaQueryWrapper<CmsHelp> w = new LambdaQueryWrapper<>();
        if (categoryId != null) w.eq(CmsHelp::getCategoryId, categoryId);
        if (keyword != null && !keyword.isBlank()) {
            w.and(q -> q.like(CmsHelp::getTitle, keyword).or().like(CmsHelp::getContent, keyword));
        }
        w.orderByAsc(CmsHelp::getId);
        Page<CmsHelp> page = helpMapper.selectPage(new Page<>(pageNum, pageSize), w);
        return R.ok(PageResult.of(page.getRecords(), page.getTotal(), pageNum, pageSize));
    }

    @GetMapping("/helps/{id}")
    public R<CmsHelp> detail(@PathVariable Long id) {
        CmsHelp h = helpMapper.selectById(id);
        if (h == null) throw new BizException(Code.BUSINESS_FAILED, "文章不存在");
        return R.ok(h);
    }

    @PostMapping("/helps")
    public R<Void> create(@RequestBody CmsHelp h) {
        h.setId(null);
        h.setReadCount(0);
        if (h.getCreateTime() == null) h.setCreateTime(LocalDateTime.now());
        if (h.getShowStatus() == null) h.setShowStatus(1);
        if (h.getSort() == null) h.setSort(0);
        helpMapper.insert(h);
        return R.ok("新增成功");
    }

    @PutMapping("/helps/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody CmsHelp h) {
        h.setId(id);
        helpMapper.updateById(h);
        return R.ok("保存成功");
    }

    @DeleteMapping("/helps/{id}")
    public R<Void> delete(@PathVariable Long id) {
        helpMapper.deleteById(id);
        return R.ok("删除成功");
    }
}
