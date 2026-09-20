# FarmLink free AI implementation status

Initial crops: Wheat, Rice, Maize. No paid APIs or always-on laptop server.

## Implemented in this iteration

- Browser price lab: import date,price CSV for a single crop, market and variety.
- Fit a linear trend, hold out the final seven observations, compare its mean absolute error with a last-price baseline, then project seven days forward.
- Suppress the sell/hold comparison when data is stale, the trend does not beat the baseline, or costs/warehouse condition are missing.
- Browser speech recognition in Hindi/English with an editable transcript and text fallback. Browser support varies and recognition may use the browser vendor's servers.
- No API subscription, model downloads, or local inference server required for these two features.

## Dependencies still needed

1. Government market history: create an account at https://www.data.gov.in/ and locate the AGMARKNET daily market prices dataset. Obtain API access if offered and review its quota. Never post the key in chat or commit it. A CSV download works with the price lab immediately, once transformed to date,price in INR/kg.
2. Bhashini: registration is at https://bhashini.gov.in/ulca/user/regis . Request the appropriate API access for the SIH project. Verify access terms and free quota before enabling. No assumption of unlimited free usage.
3. Grain grading: collect consented photos of wheat, rice and maize with an operator's grade, variety, moisture measurement, broken-grain/foreign-matter observations, lighting, and batch ID. Split evaluation by physical batch/farm to prevent near-duplicate leakage. A photograph alone cannot certify moisture, contaminants or food safety.
4. Hosted training/inference: choose a genuinely available free quota before training a crop-specific model. Do not deploy a random classifier or fixed confidence percentage as trained grading.

## Remaining engineering

- Authenticated daily market import with source timestamps, unit normalization, market/variety isolation and failure logs.
- Seasonal MSP source verification (daily mandi prices must never overwrite MSP).
- Replace the legacy market-advisory Edge Function's hard-coded MSP and its simplistic hold logic. The new browser price lab does not call this legacy function.
- Train and benchmark demand forecasts and crop vision models on real data.
- Replace fixed confidence and grading claims remaining in warehouse/detail screens with measured model reports plus operator review.
- Implement confirmed voice-to-listing drafts after the transcript; current voice only transcribes.
- Logistics optimization beyond the existing distance planner, and storage-condition-based shelf-life validation.
- Bhashini/Whisper hosted inference, toll-free calls, e-NWR and finance integrations require service access. They are not activated by this change.

## Verification

Run `node --test scripts/ai-forecast.test.mjs` and `pnpm build`.
Forecast tests check known trends, constant data, sparse data, duplicate dates and invalid input. They test code correctness; they do not establish forecasting accuracy on real crop prices.
