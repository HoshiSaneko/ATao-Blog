---
title: Maxkb实现数据库备份与恢复
date: '2025年06月06日'
tags: ['经验分享']
summary: 本文介绍Maxkb数据库的备份与恢复方法。
---
### 备份脚本

```bash
#!/bin/bash

# 定义变量
BACKUP_DIR="/opt/db_bak"        # 备份文件存储目录
DATE=$(date +%Y%m%d_%H%M%S)     # 创建时间戳
CURRENT_TIME=$(date +"%Y-%m-%d %H:%M:%S")  # 添加当前时间变量（用于日志）
DB_NAME="maxkb"                 # 数据库名
DB_USER="postgres"              # 数据库用户（根据配置修改）
DB_PASS="123123"                # 数据库密码（根据配置修改）
DB_HOST="localhost"             # 数据库主机地址
DB_PORT="5432"                  # 数据库端口

# 创建备份文件名
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$DATE.dump"

# 检查备份目录是否存在，如果不存在则创建
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo "[${CURRENT_TIME}] 备份目录不存在，已创建目录：$BACKUP_DIR"
fi

# 执行备份
echo "[${CURRENT_TIME}] 开始备份数据库：$DB_NAME"

# 使用环境变量设置密码，避免在命令行中明文传递
PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -Fc > "$BACKUP_FILE"

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "[${CURRENT_TIME}] 备份完成，文件路径：$BACKUP_FILE"
else
    echo "[${CURRENT_TIME}] 备份失败！"
    exit 1
fi

# 压缩备份文件
gzip "$BACKUP_FILE"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
echo "[${CURRENT_TIME}] 备份文件已压缩：$COMPRESSED_FILE"
echo "------------------------"
```

添加执行权限
``` bash
sudo chmod +x /opt/maxkb/backup_maxkb.sh
```

执行
```bash
sudo sh backup_maxkb.sh
```

此时默认将数据库导入到`/opt/db_bak`路径下，我们需要定时执行这个脚本。

设置定时任务

```bash
sudo crontab -e
```
在文件末尾添加

```bash
# 每周六凌晨2点进行备份
00 02 * * 6 /opt/backup_maxkb.sh >> /var/log/maxkb_backup.log 2>&1
```

### 恢复脚本

```bash
#!/bin/bash

# 定义变量
RESTORE_FILE="/opt/db_bak/maxkb-20250606_095233.dump.gz"  # 备份文件路径，支持 .gz 压缩格式
DB_NAME="maxkb"                                   # 要恢复的数据库名
DB_USER="postgres"                                # 数据库用户（根据实际情况修改）
DB_PASS="123123"                                  # 数据库密码（根据实际情况修改）
DB_HOST="localhost"                               # 数据库主机地址
DB_PORT="5432"                                    # 数据库端口
TEMP_DIR="/tmp/postgres_restore"                 # 临时解压目录

# 创建临时目录
mkdir -p "$TEMP_DIR"
echo "临时目录已创建：$TEMP_DIR"

# 检查备份文件是否存在
if [ ! -f "$RESTORE_FILE" ]; then
    echo "错误：恢复文件不存在：$RESTORE_FILE"
    exit 1
fi

# 提取文件名（不含路径）
FILENAME=$(basename "$RESTORE_FILE")

# 检查文件是否为 .gz 压缩格式
if [[ "$FILENAME" == *.gz ]]; then
    echo "检测到压缩文件，开始解压..."
    UNZIPPED_FILE="$TEMP_DIR/${FILENAME%.gz}"  # 移除 .gz 后缀

    # 解压文件
    gunzip -c "$RESTORE_FILE" > "$UNZIPPED_FILE"
    if [ $? -ne 0 ]; then
        echo "错误：解压文件失败！"
        exit 1
    fi
    echo "文件已解压至：$UNZIPPED_FILE"
else
    # 如果不是压缩文件，直接使用原文件
    UNZIPPED_FILE="$RESTORE_FILE"
fi

# 检查目标数据库是否已存在
echo "检查数据库 '$DB_NAME' 是否存在..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "数据库 '$DB_NAME' 已存在，将清空数据库并继续恢复操作..."

    # 清空数据库（危险操作！）
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    BEGIN;
    -- 关闭所有连接（避免锁表）
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();

    -- 清空所有模式下的对象（注意：会删除所有数据！）
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO public;
    GRANT ALL ON SCHEMA public TO $DB_USER;
    COMMIT;
    "

    if [ $? -ne 0 ]; then
        echo "错误：清空数据库失败！"
        exit 1
    fi
else
    echo "数据库 '$DB_NAME' 不存在，将创建新数据库..."
    # 创建新数据库
    PGPASSWORD="$DB_PASS" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    if [ $? -ne 0 ]; then
        echo "错误：创建数据库失败！"
        exit 1
    fi
fi

# 执行恢复
echo "开始从 $RESTORE_FILE 恢复数据库 $DB_NAME..."

# 使用环境变量设置密码，避免在命令行中明文传递
PGPASSWORD="$DB_PASS" pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v "$UNZIPPED_FILE"

# 检查恢复是否成功
if [ $? -eq 0 ]; then
    echo "恢复完成！"
else
    echo "错误：恢复失败！"
    exit 1
fi

# 清理临时文件
echo "清理临时文件..."
rm -rf "$TEMP_DIR"
echo "恢复过程已完成！"
```

执行

```bash
sudo bash restore_maxkb.sh
```

![恢复完成](https://cdn.atao.cyou/Blog/blog_250606_431523.png){caption:恢复完成}
