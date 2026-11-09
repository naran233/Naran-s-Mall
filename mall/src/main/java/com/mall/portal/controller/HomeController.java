package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.R;
import com.mall.mbg.entity.PmsBrand;
import com.mall.mbg.entity.PmsProduct;
import com.mall.mbg.entity.PmsProductCategory;
import com.mall.mbg.entity.SmsHomeAdvertise;
import com.mall.mbg.mapper.PmsBrandMapper;
import com.mall.mbg.mapper.PmsProductCategoryMapper;
import com.mall.mbg.mapper.PmsProductMapper;
import com.mall.mbg.mapper.SmsHomeAdvertiseMapper;
import com.mall.portal.dto.CategoryNode;
import com.mall.portal.dto.HomeBannerVO;
import jakarta.annotation.Resource;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal")
public class HomeController {

    @Resource
    private SmsHomeAdvertiseMapper advertiseMapper;
    @Resource
    private PmsBrandMapper brandMapper;
    @Resource
    private PmsProductMapper productMapper;
    @Resource
    private PmsProductCategoryMapper categoryMapper;

    @GetMapping("/home")
    public R<Map<String, Object>> home() {
        List<HomeBannerVO> advertiseList = buildBanners();
        List<PmsBrand> brandList = brandMapper.selectList(
                new LambdaQueryWrapper<PmsBrand>().eq(PmsBrand::getShowStatus, 1));
        List<PmsProduct> hotProducts = productMapper.selectList(
                new LambdaQueryWrapper<PmsProduct>().eq(PmsProduct::getPublishStatus, 1).eq(PmsProduct::getDeleteStatus, 0)
                        .orderByDesc(PmsProduct::getSale).last("LIMIT 8"));
        List<PmsProduct> newProducts = productMapper.selectList(
                new LambdaQueryWrapper<PmsProduct>().eq(PmsProduct::getPublishStatus, 1).eq(PmsProduct::getDeleteStatus, 0)
                        .eq(PmsProduct::getNewStatus, 1).last("LIMIT 8"));
        List<PmsProduct> recommendProducts = productMapper.selectList(
                new LambdaQueryWrapper<PmsProduct>().eq(PmsProduct::getPublishStatus, 1).eq(PmsProduct::getDeleteStatus, 0)
                        .eq(PmsProduct::getRecommandStatus, 1).last("LIMIT 8"));

        Map<Long, CategoryNode> map = categoryMapper.selectList(new LambdaQueryWrapper<PmsProductCategory>()).stream()
                .map(c -> {
                    CategoryNode n = new CategoryNode();
                    n.setId(c.getId());
                    n.setParentId(c.getParentId());
                    n.setName(c.getName());
                    n.setLevel(c.getLevel());
                    n.setIcon(c.getIcon());
                    return n;
                }).collect(Collectors.toMap(CategoryNode::getId, n -> n));
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

        Map<String, Object> data = new HashMap<>();
        data.put("advertiseList", advertiseList);
        data.put("brandList", brandList);
        data.put("hotProducts", hotProducts);
        data.put("newProducts", newProducts);
        data.put("recommendProducts", recommendProducts);
        data.put("categoryTree", roots);
        return R.ok(data);
    }

    /**
     * 轮播位：只取已上线且在投放时间窗内的记录，并批量补上关联商品摘要。
     * 前台据此渲染「轮播图 + 商品名/价格」并跳转 /product/{id}。
     */
    private List<HomeBannerVO> buildBanners() {
        LocalDateTime now = LocalDateTime.now();
        List<SmsHomeAdvertise> adverts = advertiseMapper.selectList(
                new LambdaQueryWrapper<SmsHomeAdvertise>()
                        .eq(SmsHomeAdvertise::getStatus, 1)
                        .and(w -> w.isNull(SmsHomeAdvertise::getStartTime).or().le(SmsHomeAdvertise::getStartTime, now))
                        .and(w -> w.isNull(SmsHomeAdvertise::getEndTime).or().ge(SmsHomeAdvertise::getEndTime, now))
                        .orderByAsc(SmsHomeAdvertise::getSort)
                        .orderByAsc(SmsHomeAdvertise::getId));

        List<Long> productIds = adverts.stream()
                .map(SmsHomeAdvertise::getProductId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, PmsProduct> productMap = productIds.isEmpty()
                ? new HashMap<>()
                : productMapper.selectBatchIds(productIds).stream()
                        .filter(p -> p.getDeleteStatus() == null || p.getDeleteStatus() == 0)
                        .collect(Collectors.toMap(PmsProduct::getId, p -> p, (a, b) -> a));

        List<HomeBannerVO> result = new ArrayList<>(adverts.size());
        for (SmsHomeAdvertise a : adverts) {
            HomeBannerVO vo = new HomeBannerVO();
            BeanUtils.copyProperties(a, vo);
            PmsProduct p = a.getProductId() == null ? null : productMap.get(a.getProductId());
            if (p != null) {
                HomeBannerVO.Product bp = new HomeBannerVO.Product();
                bp.setId(p.getId());
                bp.setName(p.getName());
                bp.setPrice(p.getPrice());
                bp.setPic(p.getPic());
                bp.setSale(p.getSale());
                vo.setProductId(p.getId());
                vo.setProduct(bp);
                // url 兜底：历史数据 url 为空时自动补商品详情链接，保证轮播可点击
                if (vo.getUrl() == null || vo.getUrl().isBlank()) {
                    vo.setUrl("/product/" + p.getId());
                }
            }
            result.add(vo);
        }
        return result;
    }
}
