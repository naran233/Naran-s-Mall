package com.mall.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.R;
import com.mall.mbg.entity.SysSetting;
import com.mall.mbg.mapper.SysSettingMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 系统设置（后台）：站点信息、客服方式、交易参数
 */
@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingController {

    @Resource
    private SysSettingMapper settingMapper;

    @GetMapping
    public R<List<SysSetting>> list() {
        return R.ok(settingMapper.selectList(new LambdaQueryWrapper<SysSetting>().orderByAsc(SysSetting::getId)));
    }

    @PutMapping
    public R<Void> save(@RequestBody Map<String, String> values) {
        values.forEach((k, v) -> {
            SysSetting s = settingMapper.selectOne(new LambdaQueryWrapper<SysSetting>().eq(SysSetting::getSettingKey, k));
            if (s == null) {
                s = new SysSetting();
                s.setSettingKey(k);
                s.setSettingValue(v);
                s.setUpdateTime(LocalDateTime.now());
                settingMapper.insert(s);
            } else {
                s.setSettingValue(v);
                s.setUpdateTime(LocalDateTime.now());
                settingMapper.updateById(s);
            }
        });
        return R.ok("保存成功");
    }
}
