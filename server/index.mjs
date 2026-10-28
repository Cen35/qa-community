import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

let nextUser = 2, nextQuestion = 3, nextAnswer = 3
const users = [{ id: 1, username: 'demo', email: 'demo@qa.local', password: 'demo123', points: 120 }]
const tokens = new Map()
const questions = [
  { id: 1, title: 'React 状态更新后，页面为什么没有重新渲染？', content: '我在组件中更新数组状态，偶尔看不到预期变化。应该从哪些地方排查？', tags: ['React', 'JavaScript'], authorId: 1, views: 86, answersCount: 1, votes: 12, isSolved: false, createdAt: '2026-10-22T09:00:00Z', updatedAt: '2026-10-22T09:00:00Z' },
  { id: 2, title: '如何设计一个清晰的 MySQL 多表关联？', content: '用户、问题、回答和点赞之间有关系，建表时外键与索引应该如何安排？', tags: ['MySQL', '后端'], authorId: 1, views: 114, answersCount: 1, votes: 18, isSolved: true, createdAt: '2026-10-18T09:00:00Z', updatedAt: '2026-10-20T09:00:00Z' },
]
const answers = [
  { id: 1, questionId: 1, authorId: 1, content: '先确认是否直接修改了原数组。React 需要一个新的引用，例如使用 `setItems(current => [...current, nextItem])`。', votes: 6, isAccepted: false, createdAt: '2026-10-22T10:00:00Z' },
  { id: 2, questionId: 2, authorId: 1, content: '先画出实体关系，再为经常查询的外键增加索引。点赞记录要用用户和目标的联合唯一约束防止重复。', votes: 9, isAccepted: true, createdAt: '2026-10-19T10:00:00Z' },
]
const votes = new Set()
const current = (req) => { const token = req.headers.authorization?.replace('Bearer ', ''); return tokens.get(token) }
const publicUser = (id) => { const user = users.find((item) => item.id === id); return user && { id: user.id, username: user.username, points: user.points } }
const viewQuestion = (question, userId) => ({ ...question, author: publicUser(question.authorId), liked: userId ? votes.has(`${userId}:question:${question.id}`) : false })

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password || password.length < 6) return res.status(400).json({ message: '请填写用户名、邮箱和至少 6 位密码。' })
  if (users.some((item) => item.username === username || item.email === email)) return res.status(409).json({ message: '用户名或邮箱已经被使用。' })
  const user = { id: nextUser++, username, email, password, points: 0 }; users.push(user)
  const token = crypto.randomUUID(); tokens.set(token, user.id); res.status(201).json({ token, user: publicUser(user.id) })
})
app.post('/api/auth/login', (req, res) => { const user = users.find((item) => (item.username === req.body.login || item.email === req.body.login) && item.password === req.body.password); if (!user) return res.status(401).json({ message: '账号或密码不正确。' }); const token = crypto.randomUUID(); tokens.set(token, user.id); res.json({ token, user: publicUser(user.id) }) })
app.get('/api/me', (req, res) => { const user = current(req); if (!user) return res.status(401).json({ message: '请先登录。' }); res.json(publicUser(user)) })
app.get('/api/questions', (req, res) => { const user = current(req), { keyword = '', tag = '', sort = 'hot', solved = '' } = req.query; let list = questions.filter((q) => (!keyword || `${q.title}${q.content}`.toLowerCase().includes(keyword.toLowerCase())) && (!tag || q.tags.includes(tag)) && (solved === '' || String(q.isSolved) === solved)); list = [...list].sort(sort === 'new' ? (a,b) => +new Date(b.createdAt) - +new Date(a.createdAt) : (a,b) => b.votes + b.answersCount * 2 - (a.votes + a.answersCount * 2)); res.json({ items: list.map((q) => viewQuestion(q, user)), tags: [...new Set(questions.flatMap((q) => q.tags))] }) })
app.get('/api/questions/:id', (req, res) => { const user = current(req), question = questions.find((q) => q.id === +req.params.id); if (!question) return res.status(404).json({ message: '问题不存在。' }); question.views++; res.json({ ...viewQuestion(question, user), answers: answers.filter((a) => a.questionId === question.id).sort((a,b) => Number(b.isAccepted) - Number(a.isAccepted) || b.votes-a.votes).map((a) => ({ ...a, author: publicUser(a.authorId), liked: user ? votes.has(`${user}:answer:${a.id}`) : false })) }) })
app.post('/api/questions', (req, res) => { const user = current(req); const { title, content, tags = [] } = req.body; if (!user) return res.status(401).json({ message: '请先登录。' }); if (!title || !content) return res.status(400).json({ message: '标题和问题描述不能为空。' }); const question = { id: nextQuestion++, title, content, tags: tags.filter(Boolean), authorId: user, views: 0, answersCount: 0, votes: 0, isSolved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; questions.unshift(question); users.find((u) => u.id === user).points -= 5; res.status(201).json(question) })
app.post('/api/questions/:id/answers', (req, res) => { const user = current(req), question = questions.find((q) => q.id === +req.params.id); if (!user) return res.status(401).json({ message: '请先登录。' }); if (!question || !req.body.content) return res.status(400).json({ message: '回答内容不能为空。' }); const answer = { id: nextAnswer++, questionId: question.id, authorId: user, content: req.body.content, votes: 0, isAccepted: false, createdAt: new Date().toISOString() }; answers.push(answer); question.answersCount++; users.find((u) => u.id === user).points += 10; res.status(201).json(answer) })
app.post('/api/:type/:id/vote', (req, res) => { const user = current(req), type = req.params.type; if (!user) return res.status(401).json({ message: '请先登录。' }); const target = type === 'questions' ? questions.find((q) => q.id === +req.params.id) : answers.find((a) => a.id === +req.params.id); if (!target) return res.status(404).json({ message: '目标不存在。' }); const key = `${user}:${type === 'questions' ? 'question' : 'answer'}:${target.id}`; const author = users.find((u) => u.id === target.authorId); if (votes.has(key)) { votes.delete(key); target.votes--; author.points -= type === 'questions' ? 5 : 10 } else { votes.add(key); target.votes++; author.points += type === 'questions' ? 5 : 10 }; res.json({ votes: target.votes, liked: votes.has(key) }) })
app.post('/api/answers/:id/accept', (req, res) => { const user = current(req), answer = answers.find((a) => a.id === +req.params.id), question = answer && questions.find((q) => q.id === answer.questionId); if (!user) return res.status(401).json({ message: '请先登录。' }); if (!answer || !question) return res.status(404).json({ message: '回答不存在。' }); if (question.authorId !== user) return res.status(403).json({ message: '只有提问者可以采纳答案。' }); if (question.isSolved) return res.status(400).json({ message: '该问题已经采纳过答案。' }); answer.isAccepted = true; question.isSolved = true; users.find((u) => u.id === answer.authorId).points += 30; res.json({ ok: true }) })
app.listen(process.env.PORT || 3002, () => console.log('QA API on 3002'))
