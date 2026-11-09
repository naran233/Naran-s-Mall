package com.mall.portal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mall.common.R;
import com.mall.mbg.entity.SysSetting;
import com.mall.mbg.mapper.SysSettingMapper;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 前台公开配置（站点名、客服联系方式、包邮门槛等）
 */
@RestController
@RequestMapping("/api/portal/settings")
public class PortalSettingController {

    @Resource
    private SysSettingMapper settingMapper;

    @GetMapping
    public R<Map<String, String>> publicSettings() {
        List<SysSetting> list = settingMapper.selectList(new LambdaQueryWrapper<SysSetting>());
        Map<String, String> map = new LinkedHashMap<>();
        for (SysSetting s : list) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        return R.ok(map);
    }
}
