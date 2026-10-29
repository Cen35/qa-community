# 问答社区

React + Vite 前端与 Node + Express 后端的问答社区课程项目。

## 功能

- 注册、登录、退出与个人积分
- 发布问题、标签、关键词搜索
- 最新、热度、未解决排序与标签筛选
- 回答问题、问题/回答点赞（每人一次，可取消）
- 提问者采纳一个最佳回答，问题变为已解决
- 积分规则：提问 -5；回答 +10；回答被采纳 +30；问题获赞 +5；回答获赞 +10

## 本地运行

```bash
npm --prefix server install
npm --prefix client install
npm run dev:server
npm run dev:client
```

浏览器打开 `http://localhost:5173`。演示账号：`demo` / `demo123`。

后端是独立 Express API，可部署到 Railway；前端通过 `VITE_API_ORIGIN` 访问它。`database.md` 给出了课程要求的 MySQL 表结构，部署后请同时截图 `/api/health` 和一次注册、发布问题或回答成功的页面，证明前后端已经连通。

## Railway + Netlify（提交材料用）

1. 在 Railway 新建服务，选择本仓库，服务根目录选择 `server`；部署成功后打开 `https://你的域名/api/health`，截图保存。
2. 在 Netlify 部署前端：Base directory 选 `client`，Build command 填 `npm run build`，Publish directory 填 `dist`。
3. 在 Netlify 的 Environment variables 新增 `VITE_API_ORIGIN`，填 Railway 域名（不要加 `/api`），重新部署。
