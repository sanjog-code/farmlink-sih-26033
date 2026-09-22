import { authenticate, consumeQuota, cors, fetchTimed, json, limitedForm, replyError, SafeError, toBase64 } from '../_shared/ai-guard.ts'
const languages = ['hi', 'en', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as']

async function transcribe(audio: File, language: string, provider: string, bytes: Uint8Array) {
  if (provider === 'bhashini') {
    const apiKey = Deno.env.get('BHASHINI_API_KEY'), serviceId = Deno.env.get(`BHASHINI_ASR_SERVICE_ID_${language.toUpperCase()}`)
    if (!apiKey || !serviceId) return null
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    const ascii = (start: number, size: number) => String.fromCharCode(...bytes.subarray(start, start + size))
    if (bytes.length < 44 || ascii(0, 4) !== 'RIFF' || ascii(8, 4) !== 'WAVE' || ascii(12, 4) !== 'fmt '
      || view.getUint16(20, true) !== 1 || view.getUint16(22, true) !== 1
      || view.getUint32(24, true) !== 16000 || view.getUint16(34, true) !== 16) {
      throw new SafeError('Bhashini needs 16 kHz mono WAV audio. Please record again or choose Whisper.', 400, 'AUDIO_FORMAT')
    }
    const response = await fetchTimed('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
      method: 'POST', headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipelineTasks: [{ taskType: 'asr', config: { serviceId, language: { sourceLanguage: language }, audioFormat: 'wav', samplingRate: 16000 } }], inputData: { audio: [{ audioContent: toBase64(bytes) }] } }),
    })
    if (!response.ok) throw new SafeError('Bhashini is unavailable at the moment.', 503, 'PROVIDER_UNAVAILABLE')
    const payload = await response.json()
    return payload?.pipelineResponse?.find((task: { taskType: string }) => task.taskType === 'asr')?.output?.[0]?.source
  }
  const key = Deno.env.get('OPENAI_API_KEY')
  if (!key) return null
  const upstream = new FormData()
  upstream.append('file', audio, audio.name || 'farmlink-recording.wav')
  upstream.append('model', 'whisper-1')
  upstream.append('language', language)
  const response = await fetchTimed('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: upstream })
  if (!response.ok) throw new SafeError('Whisper is unavailable at the moment.', 503, 'PROVIDER_UNAVAILABLE')
  return (await response.json())?.text
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const user = await authenticate(request)
    const form = await limitedForm(request, 4 * 1024 * 1024)
    const audio = form.get('audio'), language = String(form.get('language') || 'hi'), provider = String(form.get('provider') || 'auto')
    if (!(audio instanceof File) || !audio.size || audio.size > 3 * 1024 * 1024) throw new SafeError('Please use an audio recording of up to 60 seconds and 3 MB.')
    if (!['audio/wav', 'audio/x-wav', 'audio/webm', 'audio/mpeg', 'audio/mp4', 'audio/ogg'].includes(audio.type.split(';')[0])) throw new SafeError('This audio format is unsupported. Please record again.')
    if (!languages.includes(language) || !['auto', 'bhashini', 'whisper'].includes(provider)) throw new SafeError('Choose a supported language and speech engine.')
    const configured = (name: string) => name === 'whisper' ? Boolean(Deno.env.get('OPENAI_API_KEY')) : Boolean(Deno.env.get('BHASHINI_API_KEY') && Deno.env.get(`BHASHINI_ASR_SERVICE_ID_${language.toUpperCase()}`))
    const choices = (provider === 'auto' ? ['bhashini', 'whisper'] : [provider]).filter(configured)
    if (!choices.length) return json({ error: 'Cloud voice is awaiting activation. Use browser speech or type your request below.', code: 'NOT_CONFIGURED', fallback: 'browser' }, 503)
    await consumeQuota(user.id, 'voice')
    const bytes = new Uint8Array(await audio.arrayBuffer())
    for (const choice of choices) {
      try {
        const text = await transcribe(audio, language, choice, bytes)
        if (typeof text === 'string' && text.trim() && text.length <= 10000) return json({ text: text.trim(), provider: choice, language })
      } catch (error) { if (provider !== 'auto') throw error }
    }
    return json({ error: 'No transcript was available. Please try again, use browser speech, or type below.', code: 'TRANSCRIPTION_UNAVAILABLE' }, 503)
  } catch (error) { return replyError(error) }
})
