#!/usr/bin/env node
/**
 * Minimal static file server for Railway
 * Serves the Vite build in ./dist and provides SPA fallback to index.html
 */
import http from 'http'
import { readFile, stat } from 'fs/promises'
import { createReadStream, existsSync } from 'fs'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.resolve(__dirname, '..', 'dist')
const port = Number(process.env.PORT || 4173)
const host = '0.0.0.0'

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

const sendFile = async (res, filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase()
    const contentType = mimeTypes[ext] || 'application/octet-stream'
    res.statusCode = 200
    res.setHeader('Content-Type', contentType)
    createReadStream(filePath).pipe(res)
  } catch (err) {
    res.statusCode = 500
    res.end('Internal Server Error')
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`)
    let pathname = decodeURIComponent(reqUrl.pathname)

    // Normalize root to index.html
    if (pathname === '/') pathname = '/index.html'

    const filePath = path.join(distDir, pathname)

    // If the file exists, serve it
    if (existsSync(filePath) && (await stat(filePath)).isFile()) {
      return sendFile(res, filePath)
    }

    // Try with /index.html for SPA routes
    const fallbackPath = path.join(distDir, 'index.html')
    if (existsSync(fallbackPath)) {
      return sendFile(res, fallbackPath)
    }

    res.statusCode = 404
    res.end('Not Found')
  } catch (err) {
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(port, host, () => {
  console.log(`Serving dist/ on http://${host}:${port}`)
})
