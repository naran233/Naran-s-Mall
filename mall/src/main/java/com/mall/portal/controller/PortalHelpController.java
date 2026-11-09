package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.BizException;
import com.mall.common.Code;
import com.mall.common.R;
import com.mall.mbg.entity.CmsHelp;
import com.mall.mbg.entity.CmsHelpCategory;
import com.mall.mbg.mapper.CmsHelpCategoryMapper;
import com.mall.mbg.mapper.CmsHelpMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 帮助中心（前台，公开访问）
 */
@RestController
@RequestMapping("/api/portal/help")
public class PortalHelpController {

    @Resource
    private CmsHelpCategoryMapper categoryMapper;
    @Resource
    private CmsHelpMapper helpMapper;

    @GetMapping("/categories")
    public R<List<CmsHelpCategory>> categories() {
        return R.ok(categoryMapper.selectList(new LambdaQueryWrapper<CmsHelpCategory>()
                .eq(CmsHelpCategory::getShowStatus, 1).orderByAsc(CmsHelpCategory::getSort)));
    }

    @GetMapping
    public R<Map<String, Object>> list(@RequestParam(required = false) Long categoryId,
                                       @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<CmsHelp> w = new LambdaQueryWrapper<CmsHelp>()
                .eq(CmsHelp::getShowStatus, 1)
                .select(CmsHelp::getId, CmsHelp::getCategoryId, CmsHelp::getTitle,
                        CmsHelp::getReadCount, CmsHelp::getCreateTime);
        if (categoryId != null) w.eq(CmsHelp::getCategoryId, categoryId);
        if (keyword != null && !keyword.isBlank()) w.like(CmsHelp::getTitle, keyword);
        w.orderByAsc(CmsHelp::getSort).orderByDesc(CmsHelp::getId);
        return R.ok(Map.of("articles", helpMapper.selectList(w)));
    }

    @GetMapping("/{id}")
    public R<CmsHelp> detail(@PathVariable Long id) {
        CmsHelp h = helpMapper.selectById(id);
        if (h == null || (h.getShowStatus() != null && h.getShowStatus() == 0)) {
            throw new BizException(Code.BUSINESS_FAILED, "文章不存在");
        }
        CmsHelp upd = new CmsHelp();
        upd.setId(id);
        upd.setReadCount((h.getReadCount() == null ? 0 : h.getReadCount()) + 1);
        helpMapper.updateById(upd);
        h.setReadCount(upd.getReadCount());
        return R.ok(h);
    }
}
