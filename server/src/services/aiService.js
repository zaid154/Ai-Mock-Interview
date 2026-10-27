const { GoogleGenerativeAI } = require('@google/generative-ai')
const Question = require('../models/questionModel')
const Setting = require('../models/settingModel')

const COOLDOWN_MS = 60 * 1000
const lastFailedAt = new Map()
let currentKeyIndex = 0

const modelName = () => process.env.GEMINI_MODEL || 'gemini-3.7-flash'
const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
const cleanText = (val) => String(val || '').replaceAll('\\r\\n', '\n').replaceAll('\\n', '\n').replaceAll('\\t', '\t').trim()
const maskKey = (k) => (k && k.length > 10 ? `${k.slice(0, 6)}--------${k.slice(-4)}` : '--------')

function sanitizePromptText(val) {
  let cleaned = cleanText(val)
    .replace(/\/\/\s*(?:assume\b|note\b|hint\b|clue\b|bug\b|fix\b|solution\b|this causes|this triggers|fires even if|your logic here)[^\r\n]*/gi, '')
    .replace(/\/\/\s*$/gm, '')
    .trim()

  // Clean out awkward self-referential or formulaic AI opening phrases
  cleaned = cleaned
    .replace(/^In\s+(?:your\s+)?(?:Mock\s*Mate(?:\s*AI)?|AI\s+Mock\s+Interview)(?:\s+(?:platform|project|app|website|system))?,\s*/i, '')
    .replace(/\b(?:Mock\s*Mate(?:\s*AI)?)\b/gi, 'your application')
    .trim()

  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }
  return cleaned
}

async function testSingleKey(rawKey) {
  const start = Date.now()
  try {
    const model = new GoogleGenerativeAI(rawKey).getGenerativeModel({ model: modelName() })
    const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'respond with OK' }] }] })
    res.response.text()
    lastFailedAt.delete(rawKey)
    return { ok: true, latencyMs: Date.now() - start, status: 'healthy', message: 'Active and responding' }
  } catch (err) {
    const latencyMs = Date.now() - start
    const msg = err.message || String(err)
    const isQuota = msg.includes('429') || /quota|resource_exhausted/i.test(msg)
    const isInvalid = /invalid api key|api_key_invalid/i.test(msg) || msg.includes('400') || msg.includes('403')
    lastFailedAt.set(rawKey, Date.now())
    return {
      ok: false,
      latencyMs,
      status: isQuota ? 'cooldown' : isInvalid ? 'invalid' : 'error',
      errorType: isQuota ? 'quota' : isInvalid ? 'invalid_key' : 'unknown',
      message: isQuota ? 'Quota / Rate limit reached (429)' : isInvalid ? 'Invalid API key' : msg.slice(0, 80),
    }
  }
}

async function getKeyPoolDetails() {
  const pool = []
  const seen = new Set()
  const addKey = (rawKey, id, source, label, dbIndex) => {
    const k = (rawKey || '').trim()
    if (!k || seen.has(k)) return
    seen.add(k)
    pool.push({ id, rawKey: k, source, label, dbIndex, maskedKey: maskKey(k) })
  }

  addKey(process.env.GEMINI_API_KEY, 'env_primary', 'env', '.env Primary Key')
  ;(process.env.GEMINI_API_KEYS || '').split(',').forEach((k, i) => addKey(k, `env_${i + 1}`, 'env', `.env Key #${i + 1}`))

  try {
    const doc = await Setting.findOne({ key: 'gemini_api_keys' }).lean()
    if (Array.isArray(doc?.value)) {
      doc.value.forEach((item, i) => {
        const raw = typeof item === 'object' && item?.key ? item.key : item
        const lbl = typeof item === 'object' && item?.label ? item.label : `Custom DB Key #${i + 1}`
        addKey(raw, `db_${i}`, 'db', lbl, i)
      })
    }
  } catch (_) {}

  const now = Date.now()
  return pool.map((item) => {
    const failedAt = lastFailedAt.get(item.rawKey)
    const isCooling = Boolean(failedAt && now - failedAt < COOLDOWN_MS)
    return {
      id: item.id,
      source: item.source,
      dbIndex: item.dbIndex,
      label: item.label,
      maskedKey: item.maskedKey,
      status: isCooling ? 'cooldown' : 'ready',
      cooldownRemainingSec: isCooling ? Math.max(0, Math.ceil((COOLDOWN_MS - (now - failedAt)) / 1000)) : 0,
      _rawKey: item.rawKey,
    }
  })
}

async function getKeys() {
  const pool = await getKeyPoolDetails()
  return pool.map((item) => item._rawKey)
}

async function getKeyPoolStatus() {
  const pool = await getKeyPoolDetails()
  return pool.map(({ _rawKey, ...publicData }) => publicData)
}

async function testAllKeyPool() {
  const pool = await getKeyPoolDetails()
  return Promise.all(pool.map(async (item) => ({ id: item.id, label: item.label, source: item.source, maskedKey: item.maskedKey, ...(await testSingleKey(item._rawKey)) })))
}

async function testKeyById(id) {
  const pool = await getKeyPoolDetails()
  const target = pool.find((k) => k.id === id)
  if (!target) throw new Error('API Key not found in pool')
  const res = await testSingleKey(target._rawKey)
  return { id: target.id, label: target.label, source: target.source, maskedKey: target.maskedKey, ...res }
}

async function generateJson(prompt, timeoutMs = 12000) {
  const keys = await getKeys()
  if (!keys.length) throw new Error('no-keys')

  const now = Date.now()
  const fresh = keys.filter((k) => !lastFailedAt.has(k) || now - lastFailedAt.get(k) > COOLDOWN_MS)
  const cooling = keys.filter((k) => !fresh.includes(k))
  const startIdx = fresh.length > 0 ? (currentKeyIndex++ % fresh.length) : 0
  const prioritized = fresh.length > 0 ? [...fresh.slice(startIdx), ...fresh.slice(0, startIdx), ...cooling] : cooling

  let lastErr
  for (const key of prioritized) {
    try {
      const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: modelName() })
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout (${timeoutMs}ms)`)), timeoutMs))
      const res = await Promise.race([
        model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }),
        timeoutPromise,
      ])
      lastFailedAt.delete(key)
      return JSON.parse(res.response.text())
    } catch (err) {
      lastFailedAt.set(key, Date.now())
      lastErr = err
      console.warn(`Gemini key ...${key.slice(-4)} failed:`, err.message)
    }
  }
  throw lastErr || new Error('all-keys-failed')
}

async function extractResumeContext(rawText) {
  if (!rawText || !rawText.trim()) return null
  const sanitized = rawText.replace(/\s+/g, ' ').trim().slice(0, 8000)
  const prompt = `You are an expert technical ATS resume parser. Extract the structured candidate profile from this resume text into JSON. Include ONLY real facts stated in the text - do not hallucinate.\nResume Text:\n"""${sanitized}"""\n\nRespond strictly with JSON: { "name": string, "summary": string, "skills": string[], "experience": [{ "role": string, "company": string, "duration": string, "summary": string }], "projects": [{ "name": string, "technologies": string[], "description": string }], "education": [{ "degree": string, "institution": string, "year": string }], "certifications": string[] }`

  try {
    const data = await generateJson(prompt)
    if (data && typeof data === 'object') {
      return {
        name: String(data.name || '').trim(),
        summary: String(data.summary || '').trim(),
        skills: Array.isArray(data.skills) ? data.skills.map((s) => String(s).trim()).filter(Boolean) : [],
        experience: Array.isArray(data.experience) ? data.experience.map((e) => ({ role: String(e.role || '').trim(), company: String(e.company || '').trim(), duration: String(e.duration || '').trim(), summary: String(e.summary || '').trim() })) : [],
        projects: Array.isArray(data.projects) ? data.projects.map((p) => ({ name: String(p.name || '').trim(), technologies: Array.isArray(p.technologies) ? p.technologies.map((t) => String(t).trim()).filter(Boolean) : [], description: String(p.description || '').trim() })) : [],
        education: Array.isArray(data.education) ? data.education.map((ed) => ({ degree: String(ed.degree || '').trim(), institution: String(ed.institution || '').trim(), year: String(ed.year || '').trim() })) : [],
        certifications: Array.isArray(data.certifications) ? data.certifications.map((c) => String(c).trim()).filter(Boolean) : [],
      }
    }
  } catch (err) {
    console.warn('[AI Service] Gemini resume parsing failed, using fallback:', err.message)
  }
  return fallbackResumeContext(sanitized)
}

function fallbackResumeContext(text) {
  const skillsList = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Python', 'AWS', 'Docker', 'Redis', 'REST API', 'GraphQL', 'Next.js']
  const foundSkills = skillsList.filter((s) => new RegExp(`\\b${s.replace('.', '\\.')}\\b`, 'i').test(text))
  return {
    name: 'Candidate',
    summary: 'Technical candidate with experience in modern software engineering.',
    skills: foundSkills.length ? foundSkills : ['Fullstack Web Development', 'Problem Solving'],
    experience: [], projects: [], education: [], certifications: [],
  }
}

function filterRelevantContext(resumeContext, role = '', category = 'General') {
  if (!resumeContext) return ''
  const keywords = `${role} ${category}`.toLowerCase()
  const allSkills = Array.isArray(resumeContext.skills) ? resumeContext.skills : []
  const matchedSkills = allSkills.filter((s) => keywords.includes(s.toLowerCase()) || s.toLowerCase().split(' ').some((w) => w.length > 2 && keywords.includes(w)))
  const finalSkills = matchedSkills.length >= 2 ? matchedSkills.slice(0, 8) : allSkills.slice(0, 8)

  // Filter out any self-referential project referencing MockMate
  const allProjects = (Array.isArray(resumeContext.projects) ? resumeContext.projects : []).filter((p) => {
    const name = String(p.name || '').toLowerCase()
    return !name.includes('mockmate') && !name.includes('mock mate') && !name.includes('mock-mate') && !name.includes('ai mock interview')
  })
  const matchedProjects = allProjects.filter((p) => {
    const text = `${p.name} ${(p.technologies || []).join(' ')} ${p.description || ''}`.toLowerCase()
    return keywords.split(' ').some((kw) => kw.length > 2 && text.includes(kw))
  })
  const finalProjects = (matchedProjects.length ? matchedProjects : allProjects).slice(0, 2)

  const parts = []
  if (resumeContext.name) parts.push(`Candidate: ${resumeContext.name}`)
  if (finalSkills.length) parts.push(`Relevant Skills: ${finalSkills.join(', ')}`)
  if (finalProjects.length) parts.push(`Key Experience Areas: ${finalProjects.map((p) => `${p.name} (${(p.technologies || []).join(', ')})`).join(' | ')}`)
  const exp = Array.isArray(resumeContext.experience) ? resumeContext.experience : []
  if (exp.length && exp[0].role) parts.push(`Experience: ${exp[0].role} at ${exp[0].company || 'Company'}`)
  return parts.join('\n')
}

function promptContext(role, difficulty, experience, relevantResume, category) {
  const cat = category && category !== 'General' ? ` focus specifically on the "${category}" domain.` : ''
  if (relevantResume && relevantResume.trim()) {
    return {
      profile: `a "${role}" candidate (${experience || 'Fresher'} level at ${difficulty} difficulty) with this verified technical background:\n${relevantResume.trim()}`,
      rules: ` Evaluate the candidate on the technologies, architecture patterns, and engineering domains shown in their background. DO NOT rigidly quote project names (never say "In your [Project Name]..."). Never mention "MockMate" or "Mock Mate AI". Frame scenario questions naturally as an expert technical interviewer.${cat}`,
    }
  }
  return {
    profile: `a "${role}" candidate with experience level "${experience || 'Fresher'}" at ${difficulty} difficulty`,
    rules: ` Ask natural, realistic technical interview questions testing real-world engineering concepts and trade-offs. Never mention "MockMate" or "Mock Mate AI".${cat}`,
  }
}

async function generateQuestions(role, difficulty, count, experience, resumeContextOrText, category, excludePrompts = []) {
  const relevantResume = typeof resumeContextOrText === 'object' && resumeContextOrText !== null
    ? filterRelevantContext(resumeContextOrText, role, category)
    : (typeof resumeContextOrText === 'string' ? resumeContextOrText.slice(0, 1200) : '')

  const ctx = promptContext(role, difficulty, experience, relevantResume, category)
  const excludeRule = excludePrompts && excludePrompts.length > 0 ? ` Do not repeat these questions:\n${excludePrompts.map((p) => `- ${p}`).join('\n')}` : ''
  const prompt = `You are an experienced Senior Technical and Domain Interviewer conducting a professional interview screen for ${ctx.profile}.${ctx.rules}${excludeRule}
Write exactly ${count} distinct interview questions.
Rules:
- Speak as an experienced Senior/Staff Interviewer at a top tier company.
- Avoid formulaic or robotic phrasing. Never start questions with "In your [Project Name] platform," or "In your project...".
- Focus on practical trade-offs, real-world operational challenges, problem-solving, and edge cases relevant to their role.
- Match depth to ${difficulty} difficulty level. Keep questions to 1-2 clear, natural sentences.
- Never mention "MockMate" or "Mock Mate AI".
- If code snippets are included, format with markdown code fences (\`\`\`javascript ... \`\`\`) without comments that give away solutions.
- Respond strictly as JSON: { "questions": string[] }.`

  try {
    const data = await generateJson(prompt)
    const list = Array.isArray(data?.questions) ? data.questions : []
    const cleaned = list.map(sanitizePromptText).filter(Boolean).slice(0, count)
    if (cleaned.length) return cleaned
  } catch (err) {
    console.warn('[AI Service] Gemini question generation failed, using fallback:', err.message)
  }
  if (relevantResume) {
    const tailored = fallbackResumeQuestions(relevantResume, role, count, excludePrompts)
    if (tailored.length) return tailored
  }
  return await fallbackQuestions(role, difficulty, count, excludePrompts)
}

function fallbackResumeQuestions(relevantSnippet, role, count, excludePrompts = []) {
  const defaults = [
    `Can you walk me through the architecture of your key projects and the core technical decisions you made as a ${role}?`,
    `In your recent project work, how did you structure state management, asynchronous data fetching, and component hierarchy?`,
    `Tell me about a challenging technical bottleneck or production bug you solved in your applications and your debugging process.`,
    `How did you architect the backend APIs, database schemas, and caching layers to maintain high performance?`,
    `Explain your approach to testing, error boundary handling, and continuous integration across your applications.`,
  ]
  const excluded = new Set((excludePrompts || []).map((p) => p.toLowerCase().trim()))
  const available = defaults.filter((q) => !excluded.has(q.toLowerCase().trim()))
  return (available.length ? available : defaults).slice(0, count)
}

async function generateQuiz(role, difficulty, count, experience, resumeContextOrText, category, excludePrompts = []) {
  const relevantResume = typeof resumeContextOrText === 'object' && resumeContextOrText !== null
    ? filterRelevantContext(resumeContextOrText, role, category)
    : (typeof resumeContextOrText === 'string' ? resumeContextOrText.slice(0, 1200) : '')

  const ctx = promptContext(role, difficulty, experience, relevantResume, category)
  const excludeRule = excludePrompts && excludePrompts.length > 0 ? ` Do not repeat topics:\n${excludePrompts.slice(-6).map((p) => `- ${p}`).join('\n')}` : ''
  const prompt = `You are creating a multiple-choice technical quiz for ${ctx.profile}.${ctx.rules}${excludeRule} Write exactly ${count} questions. Format code snippets using markdown code fences without comments that leak answers. Each question must have 4 options and exactly one correctIndex (0-3). Respond as JSON: { "questions": [{ "prompt": string, "options": string[4], "correctIndex": number }] }.`

  const data = await generateJson(prompt)
  const list = Array.isArray(data?.questions) ? data.questions : []
  const cleaned = list
    .map((q) => {
      const options = Array.isArray(q?.options) ? q.options.map(sanitizePromptText).slice(0, 4) : []
      return { prompt: sanitizePromptText(q?.prompt), options, correctIndex: clamp(Number(q?.correctIndex) || 0, 0, options.length - 1) }
    })
    .filter((q) => q.prompt && q.options.length === 4)
    .slice(0, count)

  if (!cleaned.length) throw new Error('empty-quiz')
  return cleaned
}

function generateDefaultModelAnswer(prompt, role) {
  return `A high-scoring ${role} response should first state the core engineering definition, detail underlying runtime or architectural mechanisms, weigh performance trade-offs against alternative designs, and cite a concrete production use case or edge case.`
}

function generateDefaultTalkingPoints(answer, score) {
  const words = (answer || '').trim().split(/\s+/).filter(Boolean).length
  if (score >= 8) {
    return ['[+] Strong, accurate technical terminology', '[+] Clearly articulated architectural trade-offs', '[+] Well-structured logic flow and production perspective']
  }
  if (score >= 5) {
    return ['[+] Core definition correctly identified', '[-] Architecture trade-offs could be deeper', '[-] Could provide more concrete production examples or code']
  }
  return ['[+] Attempted basic conceptual outline', `[-] Response lacks technical depth (under ${Math.max(words, 15)} words)`, '[-] Missing real-world scalability constraints and edge cases']
}

async function evaluateInterview(role, items) {
  const transcript = items.map((it, i) => `Q${i + 1}: ${it.prompt}\nA${i + 1}: ${it.answer || '(no answer given)'}`).join('\n\n')
  const prompt = `You are a Principal Engineering Interviewer grading a mock interview for a "${role}" role.
Evaluate each question on a 10-point scale using this 4-pillar rubric:
1. technicalAccuracy (0 to 3)
2. depthAndTradeoffs (0 to 3)
3. structureAndFlow (0 to 2)
4. communication (0 to 2)
Total question score = technicalAccuracy + depthAndTradeoffs + structureAndFlow + communication (0-10).
Also provide feedback string, talkingPoints (3-4 bullet strings e.g. ["[+] ...", "[-] ..."]), and a 10/10 modelAnswer (2-4 sentences or clean code).
Transcript:\n${transcript}\n\nRespond strictly as JSON: { "perQuestion": [{ "score": number, "rubric": { "technicalAccuracy": number, "depthAndTradeoffs": number, "structureAndFlow": number, "communication": number }, "feedback": string, "talkingPoints": string[], "modelAnswer": string }], "overallScore": number, "summary": string }`

  try {
    const data = await generateJson(prompt, 20000)
    const perQuestion = items.map((it, i) => {
      const hasAnswer = Boolean((it.answer || '').trim())
      if (!hasAnswer) {
        return {
          score: 0,
          rubric: { technicalAccuracy: 0, depthAndTradeoffs: 0, structureAndFlow: 0, communication: 0 },
          feedback: 'No response was provided for this question. Make sure to attempt all questions to build interview fluency.',
          talkingPoints: ['[-] Question skipped without answer'],
          modelAnswer: generateDefaultModelAnswer(it.prompt, role),
        }
      }
      const qData = data?.perQuestion?.[i] || {}
      const rubric = {
        technicalAccuracy: clamp(Number(qData.rubric?.technicalAccuracy) || (Number(qData.score) > 0 ? Number((qData.score * 0.3).toFixed(1)) : 0), 0, 3),
        depthAndTradeoffs: clamp(Number(qData.rubric?.depthAndTradeoffs) || (Number(qData.score) > 0 ? Number((qData.score * 0.3).toFixed(1)) : 0), 0, 3),
        structureAndFlow: clamp(Number(qData.rubric?.structureAndFlow) || (Number(qData.score) > 0 ? Number((qData.score * 0.2).toFixed(1)) : 0), 0, 2),
        communication: clamp(Number(qData.rubric?.communication) || (Number(qData.score) > 0 ? Number((qData.score * 0.2).toFixed(1)) : 0), 0, 2),
      }
      const rawScore = clamp(Number(qData.score) || Math.round(rubric.technicalAccuracy + rubric.depthAndTradeoffs + rubric.structureAndFlow + rubric.communication), 0, 10)

      return {
        score: rawScore,
        rubric,
        feedback: String(qData.feedback || '').trim() || 'Constructive feedback recorded.',
        talkingPoints: Array.isArray(qData.talkingPoints) && qData.talkingPoints.length > 0 ? qData.talkingPoints.map((tp) => String(tp).trim()).filter(Boolean) : generateDefaultTalkingPoints(it.answer, rawScore),
        modelAnswer: String(qData.modelAnswer || '').trim() || generateDefaultModelAnswer(it.prompt, role),
      }
    })
    return {
      perQuestion,
      overallScore: clamp(Math.round(Number(data?.overallScore) || 0), 0, 100),
      summary: String(data?.summary || '').trim() || 'Interview performance evaluation completed.',
    }
  } catch (err) {
    console.warn('Gemini grading fallback, using calibrated rubric evaluation:', err.message)
    return fallbackEvaluation(items, role)
  }
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

async function getFastQuestions(role, difficulty = 'medium', count = 5, category = 'General', excludePrompts = []) {
  const excludedSet = new Set((excludePrompts || []).map((p) => String(p).toLowerCase().trim()))
  const queries = []
  if (role && role !== 'Software Engineer') {
    queries.push({ role: new RegExp(role.split(' ')[0], 'i'), difficulty })
    queries.push({ role: new RegExp(role.split(' ')[0], 'i') })
  }
  queries.push({ difficulty }, {})

  const pool = []
  for (const q of queries) {
    const found = await Question.find(q).limit(count * 3).lean()
    pool.push(...found)
    if (pool.length >= count * 2) break
  }

  const unique = [...new Set(pool.map((item) => item.prompt))].filter((p) => !excludedSet.has(p.toLowerCase().trim()))
  const selection = shuffle(unique).slice(0, count)

  if (selection.length < count) {
    const fallback = await fallbackQuestions(role, difficulty, count - selection.length, [...excludePrompts, ...selection])
    selection.push(...fallback)
  }
  return selection.slice(0, count)
}

async function generateFollowUpProbe(role, prompt, candidateAnswer) {
  const text = (candidateAnswer || '').trim()
  if (!text) return `Could you expand on your initial thoughts for this ${role} scenario? What specific architecture or trade-offs would you consider?`
  const aiPrompt = `You are an expert interviewer for a "${role}" position. Question: "${prompt}". Candidate answered: "${text}". Ask ONE concise probing follow-up (1-2 sentences) challenging trade-offs or edge cases. Respond as JSON: { "followUp": string }.`
  try {
    const data = await generateJson(aiPrompt, 8000)
    if (data?.followUp) return String(data.followUp).trim()
  } catch (_) {}
  return `How would your solution scale if traffic or data volume grew by 100x, and what potential failure point would you monitor first?`
}

async function fallbackQuestions(role, difficulty, count, excludePrompts = []) {
  const [byRole, byDiff, any] = await Promise.all([Question.find({ role, difficulty }).lean(), Question.find({ difficulty }).lean(), Question.find().lean()])
  const excluded = new Set((excludePrompts || []).map((p) => String(p).toLowerCase().trim()))
  const pool = [...shuffle(byRole), ...shuffle(byDiff), ...shuffle(any)].map((q) => q.prompt).filter((p) => !excluded.has(p.toLowerCase().trim()))
  const selection = shuffle([...new Set(pool)]).slice(0, count)

  const DEFAULTS = [
    `Walk me through a challenging architecture problem you solved as a ${role}.`,
    `How do you handle production outages and perform root cause analysis as a ${role}?`,
    `Explain your step-by-step approach to code reviews and maintaining quality standards.`,
    `How do you evaluate performance bottlenecks and memory leaks in your applications?`,
    `Describe how you design secure, scalable REST/GraphQL APIs for high concurrency.`,
  ].filter((p) => !excluded.has(p.toLowerCase().trim()))

  let idx = 0
  while (selection.length < count && DEFAULTS.length > 0) {
    selection.push(DEFAULTS[idx++ % DEFAULTS.length])
  }
  return selection
}

function isGibberish(text) {
  const trimmed = (text || '').trim()
  if (trimmed.length < 8) return true
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length < 2) return true
  const vowels = trimmed.match(/[aeiou]/gi)
  return !vowels || vowels.length < 2
}

const CORE_TECH_KEYWORDS = [
  'latency', 'throughput', 'concurrency', 'asynchronous', 'trade-off', 'tradeoff', 'idempotent', 'idempotency',
  'cache', 'caching', 'redis', 'index', 'indexing', 'b-tree', 'query', 'execution plan',
  'state', 'reducer', 'memo', 'virtual dom', 'hydration', 'render', 're-render', 'event loop',
  'microservices', 'replica', 'sharding', 'partition', 'failover', 'retry', 'backpressure', 'stream',
  'jwt', 'cookie', 'csrf', 'xss', 'security', 'rate limit', 'database', 'transaction', 'acid', 'scale',
  'component', 'middleware', 'schema', 'aggregation', 'nosql', 'sql', 'promise', 'callback'
]

function countKeywordMatches(text) {
  const lower = text.toLowerCase()
  return CORE_TECH_KEYWORDS.filter((kw) => lower.includes(kw)).length
}

function fallbackEvaluation(items, role = 'Software Engineer') {
  const perQuestion = items.map(({ prompt, answer }) => {
    const text = (answer || '').trim()
    const words = text.split(/\s+/).filter(Boolean).length

    if (!words || text.length < 3) {
      return {
        score: 0,
        rubric: { technicalAccuracy: 0, depthAndTradeoffs: 0, structureAndFlow: 0, communication: 0 },
        feedback: 'No response was provided for this question. Make sure to attempt all questions.',
        talkingPoints: ['[-] Question skipped without answer'],
        modelAnswer: generateDefaultModelAnswer(prompt, role),
      }
    }

    if (isGibberish(text)) {
      return {
        score: 0,
        rubric: { technicalAccuracy: 0, depthAndTradeoffs: 0, structureAndFlow: 0, communication: 0 },
        feedback: 'The response provided contains placeholder characters. Provide a comprehensive, example-driven technical explanation.',
        talkingPoints: ['[-] Response lacked intelligible technical keywords', '[-] Placeholder input detected'],
        modelAnswer: generateDefaultModelAnswer(prompt, role),
      }
    }

    const keywordHits = countKeywordMatches(text)
    let techScore = 1.0
    let depthScore = 1.0
    let flowScore = 1.0
    let commScore = 1.0

    // Multi-factor scoring: combination of length, structure, and actual technical keyword usage
    if (words >= 60 && keywordHits >= 3) {
      techScore = 2.8
      depthScore = 2.7
      flowScore = 1.9
      commScore = 1.8
    } else if (words >= 35 && keywordHits >= 2) {
      techScore = 2.2
      depthScore = 2.0
      flowScore = 1.6
      commScore = 1.5
    } else if (words >= 20 || keywordHits >= 1) {
      techScore = 1.6
      depthScore = 1.4
      flowScore = 1.2
      commScore = 1.2
    } else {
      techScore = 1.0
      depthScore = 0.8
      flowScore = 1.0
      commScore = 1.0
    }

    const score = clamp(Math.round(techScore + depthScore + flowScore + commScore), 1, 10)
    const feedback = score >= 8
      ? `Score: ${score}/10 - Thorough technical response demonstrating solid architectural reasoning and keyword comprehension.`
      : score >= 6
      ? `Score: ${score}/10 - Sound foundational explanation. Consider expanding on edge cases, latency constraints, and concrete code examples.`
      : `Score: ${score}/10 - Concise response (${words} words). Deepen technical depth by discussing runtime mechanisms and production trade-offs.`

    return {
      score,
      rubric: {
        technicalAccuracy: Number(techScore.toFixed(1)),
        depthAndTradeoffs: Number(depthScore.toFixed(1)),
        structureAndFlow: Number(flowScore.toFixed(1)),
        communication: Number(commScore.toFixed(1)),
      },
      feedback,
      talkingPoints: generateDefaultTalkingPoints(text, score),
      modelAnswer: generateDefaultModelAnswer(prompt, role),
      isHeuristicEvaluation: true,
    }
  })

  const avg = perQuestion.reduce((s, q) => s + q.score, 0) / (perQuestion.length || 1)
  return {
    perQuestion,
    overallScore: Math.round(avg * 10),
    summary: 'Evaluation calibrated across 4 core engineering pillars. Review individual rubric marks and model answers below.',
  }
}

module.exports = {
  generateQuestions,
  generateQuiz,
  evaluateInterview,
  getFastQuestions,
  generateFollowUpProbe,
  getKeyPoolStatus,
  testAllKeyPool,
  testKeyById,
  extractResumeContext,
  filterRelevantContext,
}
