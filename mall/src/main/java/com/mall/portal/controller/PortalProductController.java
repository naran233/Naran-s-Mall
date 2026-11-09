package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mall.common.PageResult;
import com.mall.common.R;
import com.mall.mbg.entity.PmsBrand;
import com.mall.mbg.entity.PmsProduct;
import com.mall.mbg.entity.PmsProductCategory;
import com.mall.mbg.entity.PmsSkuStock;
import com.mall.mbg.mapper.PmsBrandMapper;
import com.mall.mbg.mapper.PmsProductCategoryMapper;
import com.mall.mbg.mapper.PmsProductMapper;
import com.mall.mbg.mapper.PmsSkuStockMapper;
import com.mall.portal.dto.CategoryNode;
import com.mall.portal.dto.ProductDetailVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/products")
public class PortalProductController {

    @Resource
    private PmsProductMapper productMapper;
    @Resource
    private PmsSkuStockMapper skuMapper;
    @Resource
    private PmsBrandMapper brandMapper;
    @Resource
    private PmsProductCategoryMapper categoryMapper;

    @GetMapping("/search")
    public R<PageResult<PmsProduct>> search(@RequestParam(required = false) String keyword,
                                            @RequestParam(required = false) Long categoryId,
                                            @RequestParam(required = false) Long brandId,
                                            @RequestParam(defaultValue = "1") long pageNum,
                                            @RequestParam(defaultValue = "12") long pageSize,
                                            @RequestParam(defaultValue = "sale") String sort) {
        LambdaQueryWrapper<PmsProduct> w = new LambdaQueryWrapper<>();
        w.eq(PmsProduct::getPublishStatus, 1).eq(PmsProduct::getDeleteStatus, 0);
        if (keyword != null && !keyword.isBlank()) {
            w.like(PmsProduct::getName, keyword);
        }
        if (categoryId != null) {
            w.eq(PmsProduct::getProductCategoryId, categoryId);
        }
        if (brandId != null) {
            w.eq(PmsProduct::getBrandId, brandId);
        }
        switch (sort) {
            case "priceAsc" -> w.orderByAsc(PmsProduct::getPrice);
            case "priceDesc" -> w.orderByDesc(PmsProduct::getPrice);
            case "new" -> w.orderByDesc(PmsProduct::getNewStatus).orderByDesc(PmsProduct::getId);
            default -> w.orderByDesc(PmsProduct::getSale);
        }
        Page<PmsProduct> page = productMapper.selectPage(new Page<>(pageNum, pageSize), w);
        return R.ok(PageResult.of(page.getRecords(), page.getTotal(), pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public R<ProductDetailVO> detail(@PathVariable Long id) {
        PmsProduct p = productMapper.selectById(id);
        if (p == null || p.getDeleteStatus() == 1) {
            return R.fail(com.mall.common.Code.BUSINESS_FAILED, "商品不存在");
        }
        ProductDetailVO vo = new ProductDetailVO();
        vo.setId(p.getId());
        vo.setName(p.getName());
        vo.setPic(p.getPic());
        vo.setPrice(p.getPrice());
        vo.setSale(p.getSale());
        vo.setStock(p.getStock());
        vo.setDescription(p.getDescription());
        PmsBrand brand = brandMapper.selectById(p.getBrandId());
        vo.setBrandName(brand == null ? "" : brand.getName());
        PmsProductCategory cat = categoryMapper.selectById(p.getProductCategoryId());
        vo.setProductCategoryName(cat == null ? "" : cat.getName());
        vo.setSkus(skuMapper.selectList(new LambdaQueryWrapper<PmsSkuStock>().eq(PmsSkuStock::getProductId, id)));
        return R.ok(vo);
    }

    @GetMapping("/productCategories/tree")
    public R<List<CategoryNode>> categoryTree() {
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

    @GetMapping("/brands")
    public R<List<PmsBrand>> brands() {
        return R.ok(brandMapper.selectList(new LambdaQueryWrapper<PmsBrand>().eq(PmsBrand::getShowStatus, 1)));
    }
}
