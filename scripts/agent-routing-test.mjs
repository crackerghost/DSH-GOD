import assert from 'node:assert/strict'
import process from 'node:process'
import { buildAgentAutoEntry, isAgentAutoEntry, selectAgentCandidates } from '../src/combos.js'
import { stubUpstream, chatFrames } from './lib/fake-kernel.mjs'

const catalog = [
  { id: 'tool-good', channel: 'free', contextWindow: 32768, maxOutput: 4096, toolCalling: true, reasoning: true, vision: true },
  { id: 'tool-unknown', channel: 'free', contextWindow: 131072, maxOutput: 8192, reasoning: true, vision: true },
  { id: 'tool-bad', channel: 'free', contextWindow: 262144, maxOutput: 8192, toolCalling: false, vision: true },
  { id: 'text-only', channel: 'free', contextWindow: 1048576, maxOutput: 8192, toolCalling: true, reasoning: true, vision: false },
  { id: 'combo:manual', channel: 'combo', combo: ['tool-good'], contextWindow: 32768 },
]
const auto = buildAgentAutoEntry(catalog)
assert.ok(isAgentAutoEntry(auto))
assert.deepEqual(auto.combo, ['tool-good', 'tool-unknown', 'tool-bad', 'text-only'])
assert.equal(auto.vision, true)

const tools = [{ name: 'read_file', description: 'Read a project file', parameters: { type: 'object' } }]
const request = { messages: [{ role: 'user', content: 'inspect project' }], tools, toolChoice: 'required' }
const ordered = selectAgentCandidates(auto, catalog, {
  ...request,
  routing: { agentCapabilities: {
    'tool-good': { toolCalling: false, checkedAt: new Date().toISOString() },
    'tool-unknown': { toolCalling: true, checkedAt: new Date().toISOString() },
  } },
})
assert.deepEqual(ordered.map(row => row.id), ['tool-unknown', 'text-only'])

const imageRequest = { messages: [{ role: 'user', content: [{ type: 'image', image_url: 'data:image/png;base64,AAAA' }] }] }
assert.deepEqual(selectAgentCandidates(auto, catalog, imageRequest).map(row => row.id), ['tool-good', 'tool-unknown', 'tool-bad'])
assert.deepEqual(selectAgentCandidates(auto, catalog, {
  messages: [{ role: 'user', content: 'x'.repeat(900_000) }], maxTokens: 1000,
}).map(row => row.id), ['text-only'])

console.log('agent routing selection checks passed')

const toolFrame = name => [
  `data: ${JSON.stringify({ choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id: 'call_auto', type: 'function', function: { name, arguments: '{"path":"README.md"}' } }] }, finish_reason: null }] })}\n\n`,
  `data: ${JSON.stringify({ choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }] })}\n\n`,
  'data: [DONE]\n\n',
].join('')
const upstream = await stubUpstream({ answer: (model, body) => {
  if (model === 'agent-first') return { body: chatFrames('I will read the file now.') }
  return { body: toolFrame(body.tools?.[0]?.function?.name ?? 'read_file') }
} })
process.env.OUR_FREE_MODEL_BASE = upstream.base
const { computeMembership } = await import('../src/core/runtime.js')
const membership = computeMembership([...catalog, auto], {}, { exposeRegionModels: true })
assert.ok(membership['our-free-model'].includes(auto.id), 'virtual route is always listed while at least one real model is configured')
const { FreeModelAdapter, ROUTE_MAIN } = await import('../src/adapter.js')
const liveCatalog = [
  { id: 'agent-first', channel: 'free', contextWindow: 32768, maxOutput: 4096 },
  { id: 'agent-second', channel: 'free', contextWindow: 32768, maxOutput: 4096 },
]
const liveAuto = buildAgentAutoEntry(liveCatalog)
const learned = []
const adapter = new FreeModelAdapter({
  state: () => ({ catalog: [...liveCatalog, liveAuto], membership: { [ROUTE_MAIN]: liveCatalog.map(row => row.id).concat(liveAuto.id) }, settings: { enabled: true, defaultMaxTokens: 4096, streamRecovery: false }, attributionUserAgent: 'agent-routing-offline-test' }),
  recordUsage: () => {},
  recordTurn: () => {},
  recordAgentCapability: (model, toolCalling) => learned.push({ model, toolCalling }),
  warn: () => {},
})
const chunks = []
for await (const chunk of adapter.stream({
  provider: ROUTE_MAIN, model: liveAuto.id, maxTokens: 1024, sessionId: 'auto-test',
  messages: [{ role: 'user', content: [{ type: 'text', text: 'Read the project README.' }] }],
  tools: [{ name: 'read_file', description: 'Read a file', parameters: { type: 'object', properties: { path: { type: 'string' } } } }],
  toolChoice: 'required', signal: new AbortController().signal,
})) chunks.push(chunk)
assert.equal(upstream.requests.length, 2, 'ignored required tools trigger a second model attempt')
assert.equal(upstream.requests[0].body.tool_choice, 'required')
assert.ok(chunks.some(chunk => chunk.type === 'tool-call-delta'), 'the successful tool call reaches the agent')
assert.deepEqual(learned, [{ model: 'agent-first', toolCalling: false }, { model: 'agent-second', toolCalling: true }])
await upstream.close()
console.log('agent routing adapter failover checks passed')
