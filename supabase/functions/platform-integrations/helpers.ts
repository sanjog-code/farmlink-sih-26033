export const maskEmail = (email: string) => email.replace(/^(.{0,2})[^@]*@/, '$1…@');

export function configuredServices(env: (key: string) => string | undefined) {
  const required: Record<string, string[]> = {
    marketData: ['DATA_GOV_IN_API_KEY'],
    email: ['RESEND_API_KEY', 'NOTIFICATION_FROM_EMAIL'],
    whisper: ['OPENAI_API_KEY'],
    bhashini: ['BHASHINI_API_KEY', 'BHASHINI_ASR_SERVICE_ID_HI'],
    grading: ['GRADING_API_URL', 'GRADING_API_KEY'],
    ondcPartner: ['ONDC_PARTNER_URL', 'ONDC_PARTNER_API_KEY'],
  };
  return Object.fromEntries(Object.entries(required).map(([service, keys]) => [service, {
    configured: keys.every(key => Boolean(env(key)?.trim())),
    missing: keys.filter(key => !env(key)?.trim()),
  }]));
}

export function safePartnerUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port && url.port !== '443' ||
    /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname) || !url.hostname.includes('.')) {
    throw new Error('ONDC partner endpoint must be a public HTTPS address');
  }
  return url.toString();
}
