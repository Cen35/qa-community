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

后端默认使用内存数据，适合课堂演示；`database.md` 给出了 MySQL 表结构。
