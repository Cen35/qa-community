process.env.VERCEL = '1'
const { app } = await import('../server/index.mjs')

export default (req, res) => {
  // Vercel can pass the route suffix without /api; normalize it for Express.
  if (!req.url.startsWith('/api/')) req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`
  return app(req, res)
}
