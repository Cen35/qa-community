# 问答社区数据库设计

- `users`：id、username、email、password、avatar、points、created_at
- `questions`：id、title、content、tags(JSON)、author_id、views、answers_count、votes、is_solved、created_at、updated_at
- `answers`：id、content、question_id、author_id、votes、is_accepted、created_at
- `votes`：id、user_id、target_type(question/answer)、target_id、created_at；`user_id + target_type + target_id` 唯一。

实现 MySQL 时，点赞和采纳应使用事务，确保 votes、积分与目标计数同步更新。
