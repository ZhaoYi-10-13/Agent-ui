# Gary Agent RAG UI & Backend 部署说明

本项目包含两个部分：  
- **前端 (Agent-ui)**：基于 React + Vite 构建的展示页面  
- **后端 (Gary-Agent-RAG)**：基于 FastAPI + Uvicorn 的 RAG 服务  

本文档说明如何在 **阿里云服务器** 上部署并运行。

---

## 🔧 前置要求

- 一台阿里云服务器（Linux，推荐 Ubuntu 20.04/22.04）  
- 已开放端口：
  - **80** (后端 API)
  - **3000** (前端页面预览，或使用 Nginx 代理到 80)  
- 已安装的软件：
  - `python3` (>=3.9)
  - `pip` (>=21)
  - `node` + `npm` (推荐 `apt install -y nodejs npm`)
  - `git`

---

## 📥 克隆项目

```bash
# 进入服务器目录
cd Gary-Agent-RAG
# 克隆后端和前端仓库
git clone https://github.com/ZhaoYi-10-13/Agent-ui.git
```

---

## 🚀 部署后端 (FastAPI + Uvicorn)

### 1. 创建虚拟环境并安装依赖

```bash
cd ~/Gary-Agent-RAG
python3 -m venv venv_gary_rag
source venv_gary_rag/bin/activate
pip install -r requirements.txt
```

### 2. 测试运行后端

```bash
uvicorn main:app --host 0.0.0.0 --port 80
```

访问 http://<你的公网IP>/healthz，若返回 {"status": "ok"} 则说明成功。

---

## 🌐 部署前端 (React + Vite)

### 1. 安装依赖

```bash
cd ~/Gary-Agent-RAG/Agent-ui
npm install
```

### 2. 构建生产文件

```bash
npm run build
```

生成的静态文件在 dist/ 目录下。

### 3. 运行预览 (调试用)

```bash
npm run preview -- --host 0.0.0.0 --port 3000
```

现在可以通过 http://<你的公网IP>:3000 访问首页。

---

## 🎨 首页功能说明
- 欢迎界面：
- 标题：Welcome to Gary Corporation AI Agent
- 口号：Empowering Intelligence · Unlocking Insights
- 功能卡片：
- 进入 Chat → 跳转到 http://<你的公网IP>/chat
- 后端健康 → 自动检查 API /healthz 状态并显示 RTT

---

## ✅ 检查部署
- 前端首页：http://<你的公网IP>:3000
- 点击按钮 → 打开后端 Chat 界面：http://<你的公网IP>/chat
- 健康检查：http://<你的公网IP>/healthz
