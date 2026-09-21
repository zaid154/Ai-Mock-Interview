import { useMemo, useState } from 'react'
import { Code2, Copy, Check } from 'lucide-react'
import { formatGeneratedText } from '../lib/text'

export function parsePromptBlocks(rawText) {
  const normalized = formatGeneratedText(rawText)
  if (!normalized.includes('```')) {
    return [{ type: 'text', content: normalized }]
  }

  const blocks = []
  const regex = /```([a-zA-Z0-9_+-]*)\r?\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = normalized.slice(lastIndex, match.index)
      if (textChunk.trim()) {
        blocks.push({ type: 'text', content: textChunk })
      }
    }
    const lang = (match[1] || '').trim().toLowerCase() || 'code'
    const code = match[2].replace(/^\r?\n+|\r?\n+$/g, '')
    blocks.push({ type: 'code', lang, content: code })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < normalized.length) {
    const textChunk = normalized.slice(lastIndex)
    if (textChunk.trim()) {
      blocks.push({ type: 'text', content: textChunk })
    }
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', content: normalized }]
}

function renderInline(text) {
  if (!text) return null
  const segments = text.split(/(`[^`]+`)/g)
  return segments.map((seg, i) => {
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length >= 2) {
      return (
        <code key={i} className="inline-code">
          {seg.slice(1, -1)}
        </code>
      )
    }
    return seg
  })
}

export default function FormattedPrompt({ text, className = '' }) {
  const [copiedIdx, setCopiedIdx] = useState(null)
  const blocks = useMemo(() => parsePromptBlocks(text), [text])

  const copyCode = (code, idx) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    }
  }

  return (
    <div className={`formatted-prompt ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === 'code') {
          const isCopied = copiedIdx === i
          return (
            <div key={i} className="code-card">
              <div className="code-card-header">
                <span className="code-card-lang">
                  <Code2 size={13} /> {b.lang}
                </span>
                <button
                  type="button"
                  className="code-card-copy"
                  onClick={() => copyCode(b.content, i)}
                  title="Copy code snippet"
                >
                  {isCopied ? <Check size={12} style={{ color: 'var(--good)' }} /> : <Copy size={12} />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="code-card-body">
                <code>{b.content}</code>
              </pre>
            </div>
          )
        }
        return (
          <div key={i} className="prompt-text-chunk" style={{ whiteSpace: 'pre-wrap', margin: '0.35rem 0' }}>
            {renderInline(b.content)}
          </div>
        )
      })}
    </div>
  )
}
