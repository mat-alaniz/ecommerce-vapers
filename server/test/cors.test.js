import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import { createCorsMiddleware } from '../src/config/cors.js'

const startTestServer = async (t, corsMiddleware) => {
  const app = express()
  app.use(corsMiddleware)
  app.get('/health', (req, res) => res.json({ status: 'OK' }))
  const server = app.listen(0)

  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })

  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
  }))

  return `http://127.0.0.1:${server.address().port}/health`
}

test('production CORS requires at least one configured origin', () => {
  assert.throws(
    () => createCorsMiddleware('production', ' , '),
    /CORS_ORIGINS debe incluir/
  )
})

test('production CORS allows configured origins and blocks others', async t => {
  const url = await startTestServer(
    t,
    createCorsMiddleware('production', 'https://shop.example, https://www.shop.example')
  )

  const allowed = await fetch(url, { headers: { Origin: 'https://shop.example' } })
  const blocked = await fetch(url, { headers: { Origin: 'https://untrusted.example' } })

  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://shop.example')
  assert.equal(blocked.headers.get('access-control-allow-origin'), null)
})
