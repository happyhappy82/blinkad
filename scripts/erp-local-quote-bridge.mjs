import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const blinkadRoot = path.resolve(__dirname, '..')
const port = String(process.env.ERP_ACTION_WORKER_PORT || process.env.QUOTE_WORKER_PORT || 8787)
const subdomain = process.env.ERP_ACTION_WORKER_TUNNEL_SUBDOMAIN || 'blinkad-erp-automation-1976'
const tunnelUrl = `https://${subdomain}.loca.lt`
const children = []

function pipeOutput(name, stream) {
  let buffer = ''
  stream.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim()) continue
      console.log(`[${name}] ${line}`)
      const tunnelMatch = line.match(/your url is:\s*(https?:\/\/\S+)/i)
      if (name === 'tunnel' && tunnelMatch) {
        console.log(`ERP_ACTION_WORKER_WEBHOOK_URL=${tunnelMatch[1]}`)
      }
    }
  })
}

function start(name, command, args) {
  const child = spawn(command, args, {
    cwd: blinkadRoot,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push(child)
  pipeOutput(name, child.stdout)
  pipeOutput(name, child.stderr)
  child.on('exit', (code, signal) => {
    if (signal) return
    if (code && code !== 0) console.error(`[${name}] exited with code ${code}`)
  })
  return child
}

function cleanup() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
}

process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})
process.on('SIGTERM', () => {
  cleanup()
  process.exit(0)
})
process.on('exit', cleanup)

console.log(`Starting BlinkAd ERP quote bridge on ${tunnelUrl}`)
console.log(`Use ERP_ACTION_WORKER_WEBHOOK_URL=${tunnelUrl} for the erp/automation Vercel Preview.`)

start('worker', 'node', ['scripts/erp-quote-worker.mjs'])
start('tunnel', 'npx', ['--yes', 'localtunnel', '--port', port, '--subdomain', subdomain])
setInterval(() => {}, 60 * 60 * 1000)
