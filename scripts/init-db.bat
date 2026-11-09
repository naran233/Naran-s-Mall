@echo off
REM ============================================
REM  mall 数据库一键初始化 / 重建（Windows）
REM  用法: 双击运行，或在 cmd 中执行 scripts\init-db.bat
REM  可通过环境变量覆盖: MYSQL_BIN / DB_USER / DB_PASSWORD / DB_HOST / DB_PORT
REM ============================================
setlocal

if "%MYSQL_BIN%"=="" set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
if "%DB_USER%"=="" set DB_USER=root
if "%DB_PASSWORD%"=="" set DB_PASSWORD=123456
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=3306

set SQL_FILE=%~dp0..\mall\src\main\resources\db\mall.sql
set SEED_FILE=%~dp0..\mall\src\main\resources\db\seed_data.sql

if not exist "%MYSQL_BIN%" (
  echo [ERROR] 未找到 mysql 客户端: %MYSQL_BIN%
  echo         请设置环境变量 MYSQL_BIN 指向 mysql.exe
  exit /b 1
)
if not exist "%SQL_FILE%" (
  echo [ERROR] 未找到建库脚本: %SQL_FILE%
  exit /b 1
)

echo [1/3] 正在导入建库脚本（表结构 + 基础数据）...
"%MYSQL_BIN%" -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASSWORD% --default-character-set=utf8mb4 < "%SQL_FILE%"
if errorlevel 1 (
  echo [ERROR] 导入失败，请检查 MySQL 是否启动及账号密码是否正确
  exit /b 1
)

echo [2/3] 正在导入种子数据（多品类商品 / 会员 / 订单）...
if exist "%SEED_FILE%" (
  "%MYSQL_BIN%" -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASSWORD% --default-character-set=utf8mb4 < "%SEED_FILE%"
  if errorlevel 1 (
    echo [ERROR] 种子数据导入失败: %SEED_FILE%
    exit /b 1
  )
) else (
  echo [WARN] 未找到种子数据脚本，已跳过: %SEED_FILE%
)

echo [3/3] 校验数据表与数据量...
"%MYSQL_BIN%" -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASSWORD% -e "SELECT COUNT(*) AS tables_count FROM information_schema.tables WHERE table_schema='mall'; SELECT (SELECT COUNT(*) FROM mall.pms_product) AS products, (SELECT COUNT(*) FROM mall.pms_product_category) AS categories, (SELECT COUNT(*) FROM mall.ums_member) AS members, (SELECT COUNT(*) FROM mall.oms_order) AS orders;"
if errorlevel 1 exit /b 1

echo [OK] 数据库初始化完成。
endlocal
