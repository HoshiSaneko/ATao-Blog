---
title: ubuntu22.04源码部署maxkb
date: '2025年03月17日'
tags: ['经验分享']
summary: 本文介绍在Ubuntu 22.04环境下源码部署Maxkb的完整流程，适用于AI应用部署场景。
---
## 源码下载

从[maxkb项目](https://github.com/1Panel-dev/MaxKB)中拉取最新源码.

![拉取源码](https://cdn.atao.cyou/Blog/blog_250317_091220.png){caption:拉取源码}

## 前端依赖

### Nodejs

前端依赖下载需要使用较高版本的Nodejs，使用apt查看可下载的Node的版本信息

```bash
apt list -a nodejs
```

![nodejs版本](https://cdn.atao.cyou/Blog/blog_250317_092014.png){caption:nodejs版本}

发现没有较新的22版本，运行下面的命令

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
# 安装完成后，检查 Node.js 和 npm 的版本
node -v
npm -v
```

![更新nodejs版本](https://cdn.atao.cyou/Blog/blog_250317_092634.png){caption:更新nodejs版本}

### 下载源

安装好npm后，需要配置npm源，建议使用以下命令添加国内源

```bash
npm config set registry https://registry.npmmirror.com
```

### 安装依赖

使用以下命令安装前端所需依赖

```bash
cd ui   # 需要先切换至ui目录
npm install
```

![下载依赖项](https://cdn.atao.cyou/Blog/blog_250317_093133.png){caption:下载依赖项}

## 后端依赖

### python

python版本不能低于3.11,使用以下命令进行安装

```bash
sudo apt update  # 更新系统包列表
sudo apt install software-properties-common -y # ​安装依赖项
sudo add-apt-repository ppa:deadsnakes/ppa # 添加 Deadsnakes PPA
sudo apt install python3.11  # ​安装 Python 3.11
```

### poetry

通过以下命令进行安装

```bash
pip install poetry==1.8.5
```

### 安装依赖

使用以下命令安装后端所需依赖(需要较长时间)

```bash
cd ..   # 需要先切换至项目根目录
poetry install
```

![安装依赖](https://cdn.atao.cyou/Blog/blog_250317_095147.png){caption:安装依赖}

## Postgresql(数据库)

### 安装Postgresql

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null  # 启用它的官方包存储库
sudo apt update  # 获取包的最新版本
sudo apt install postgresql postgresql-client postgresql-server-dev-17 -y   # 安装服务端，客户端，开发套件
sudo systemctl status postgresql  # 验证 PostgreSQL 服务是否启动并运行
```

![安装Postgresql](https://cdn.atao.cyou/Blog/blog_250317_111914.png){caption:安装Postgresql}

### 更新密码

使用下面命令进入psql, 并更新管理员用户密码

```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD '123123';
```

输入`\q`退出

### 安装插件

执行以下指令，安装vector插件

```bash
cd /tmp
git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

如果make命令报错，可能需要额外安装gcc和make工具:

```bash
apt install make gcc
```

### 创建数据库

使用`psql -h localhost -U postgres`输入密码并登录数据库，按行执行下面的sql

```sql
CREATE DATABASE "maxkb";
\c "maxkb";
CREATE EXTENSION "vector";
```

## 配置文件

将项目根目录下的`config_example.yml`配置文件拷贝至/opt/maxkb/conf目录下

``` bash
sudo mkdir -p /opt/maxkb/conf
sudo cp config_example.yml /opt/maxkb/conf
```

修在`/opt/maxkb/conf/config_example.yml`内容如下（如果按照的是上面的步骤，则只需要修改 DB_USER: postgres和 DB_PASSWORD: 123123）

```yaml
# 数据库链接信息
DB_NAME: maxkb
DB_HOST: localhost
DB_PORT: 5432
DB_USER: postgres
DB_PASSWORD: 123123
DB_ENGINE: django.db.backends.postgresql_psycopg2

DEBUG: false

TIME_ZONE: Asia/Shanghai
```

## 启动

### 启动后端

```bash
python3 main.py start
```

- 如果抛出异常，可能是有些库没有安装。执行以下指令，安装缺少的库

```bash
pip install -r requirements.txt
```

### 启动前端

需要在`ui`目录下启动

```bash
cd ui
npm run dev
```

通过浏览器打开`http://localhost:3000/ui/`, 可以看到Maxkb的登录页面(第一次启动可能需要较长时间)

> 用户名：admin  
> 密码：MaxKB@123..

![前端页面](https://cdn.atao.cyou/Blog/blog_250317_173630.png){caption:前端页面}

## 解除限制

需要修改以下文件

### user_serializers.py

- 修改文件: apps/users/serializers/user_serializers.py

- 修改位置: 注释掉`valid_license`修饰器。分别大概在188、775行左右

- 修改后:

![user_serializers.py修改处1](https://cdn.atao.cyou/Blog/blog_250317_174828.png){caption:user_serializers.py修改处1}

![user_serializers.py修改处2](https://cdn.atao.cyou/Blog/blog_250317_174837.png){caption:user_serializers.py修改处2}

### application_serializers.py

- 修改文件: apps/application/serializers/application_serializers.py

- 修改位置: 注释掉`valid_license`修饰器。分别大概在513、720行左右

- 修改后:

![application_serializers.py修改处1](https://cdn.atao.cyou/Blog/blog_250317_180914.png){caption:application_serializers.py修改处1}

![application_serializers.py修改处2](https://cdn.atao.cyou/Blog/blog_250317_180919.png){caption:application_serializers.py修改处2}

### dataset_serializers.py

- 修改文件: apps/dataset/serializers/dataset_serializers.py

- 修改位置: 注释掉`valid_license`修饰器。大概在412行左右

- 修改后:

![dataset_serializers.py修改处1](https://cdn.atao.cyou/Blog/blog_250317_181132.png){caption:dataset_serializers.py修改处1}

### valid_serializers.py

- 修改文件: apps/setting/serializers/valid_serializers.py

- 修改位置: 将count数量调整为`999999`, 注释掉valid的判断过程，直接返回True

- 修改后:

![valid_serializers.py修改处1](https://cdn.atao.cyou/Blog/blog_250317_180445.png){caption:valid_serializers.py修改处1}

## Ollama

### 安装

执行以下命令，安装ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

![安装ollama](https://cdn.atao.cyou/Blog/blog_250318_085030.png){caption:安装ollama}

### 添加模型

浏览器打开MaxKB主界面:`http://localhost:3000/`

依次点击系统设置,模型设置，添加模型

![添加模型](https://cdn.atao.cyou/Blog/blog_250317_183035.png){caption:添加模型}

![填写API](https://cdn.atao.cyou/Blog/blog_250317_183045.png){caption:填写API}
