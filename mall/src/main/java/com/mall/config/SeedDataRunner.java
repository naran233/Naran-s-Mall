package com.mall.config;

import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 种子数据初始化器：
 * 读取 classpath:db/seed_data.sql（由 scripts/gen-seed-sql.mjs 生成），
 * 在应用启动时执行一次，写入多品类商品、会员账户与各状态订单样本。
 *
 * 幂等策略：
 * 1. SQL 文件内部先按固定 ID 区间清理旧种子数据，再整体重建；
 * 2. 通过 sys_setting.seed_version 记录已执行版本，版本一致则直接跳过；
 * 3. 整体在一个事务内执行，失败自动回滚且不阻断应用启动；
 * 4. 可通过 mall.seed.enabled=false 关闭。
 */
@Component
@Order(3)
public class SeedDataRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedDataRunner.class);
    private static final String SQL_PATH = "db/seed_data.sql";
    private static final Pattern VERSION_PATTERN =
            Pattern.compile("seed_version'\\s*,\\s*'([^']+)'");

    @Resource
    private JdbcTemplate jdbc;
    @Resource
    private PlatformTransactionManager transactionManager;

    @Value("${mall.seed.enabled:true}")
    private boolean enabled;

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("[SeedData] mall.seed.enabled=false，跳过种子数据初始化");
            return;
        }
        try {
            String sql = readSql();
            if (sql == null || sql.isBlank()) {
                log.warn("[SeedData] 未找到 {}，跳过", SQL_PATH);
                return;
            }
            String version = parseVersion(sql);
            String applied = appliedVersion();
            if (version != null && version.equals(applied)) {
                log.info("[SeedData] 种子数据版本 {} 已初始化，跳过", version);
                return;
            }
            int executed = executeInTransaction(sql);
            log.info("[SeedData] 种子数据初始化完成，版本 {}，执行 {} 条语句", version, executed);
        } catch (Exception e) {
            // 种子数据属于辅助内容，失败只记录日志，不影响应用启动
            log.error("[SeedData] 初始化失败，已回滚：{}", e.getMessage(), e);
        }
    }

    private String readSql() throws Exception {
        ClassPathResource resource = new ClassPathResource(SQL_PATH);
        if (!resource.exists()) return null;
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append('\n');
            }
        }
        return sb.toString();
    }

    private String parseVersion(String sql) {
        Matcher m = VERSION_PATTERN.matcher(sql);
        return m.find() ? m.group(1) : null;
    }

    private String appliedVersion() {
        try {
            return jdbc.queryForObject(
                    "SELECT setting_value FROM sys_setting WHERE setting_key = 'seed_version'", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    /** 按行切分语句（SQL 文件约定：注释行以 -- 开头，语句以 ; 结束，字符串内不含分号） */
    private int executeInTransaction(String sql) {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        Integer executed = tx.execute(status -> {
            StringBuilder buffer = new StringBuilder();
            int count = 0;
            for (String raw : sql.split("\n")) {
                String line = raw.trim();
                if (line.isEmpty() || line.startsWith("--")) continue;
                buffer.append(raw).append('\n');
                if (line.endsWith(";")) {
                    String stmt = buffer.toString().trim();
                    stmt = stmt.substring(0, stmt.length() - 1).trim();
                    buffer.setLength(0);
                    if (stmt.isEmpty()) continue;
                    jdbc.execute(stmt);
                    count++;
                }
            }
            if (!buffer.toString().trim().isEmpty()) {
                jdbc.execute(buffer.toString().trim());
                count++;
            }
            return count;
        });
        return executed == null ? 0 : executed;
    }
}
