import { authenticate, database, json, cors, replyError, SafeError } from '../_shared/ai-guard.ts'
Deno.serve(async request => {
  if(request.method==='OPTIONS') return new Response('ok',{headers:cors})
  if(request.method!=='POST') return json({error:'Method not allowed'},405)
  try {
    await authenticate(request)
    const {crop}=await request.json()
    if(typeof crop!=='string'||!crop.trim()||crop.length>120) throw new SafeError('Choose a crop.')
    const response=await database('msp_rates?crop=eq.'+encodeURIComponent(crop)+'&select=msp_per_kg,marketing_season,source_url,updated_at')
    if(!response.ok) throw new SafeError('MSP is temporarily unavailable.',503)
    const [msp]=await response.json()
    // Query through the caller's RLS for a privacy-preserving aggregate.
    const salesResponse=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/market_sales_summary',{method:'POST',headers:{apikey:Deno.env.get('SUPABASE_ANON_KEY')!,Authorization:request.headers.get('authorization')!,'Content-Type':'application/json'},body:JSON.stringify({p_crop:crop}),signal:AbortSignal.timeout(10000)})
    const sales=salesResponse.ok?await salesResponse.json():null
    return json({crop,mspPerKg:msp?Number(msp.msp_per_kg):0,msp:msp||null,recentSales:sales,
      advice:'Compare your offer with the verified MSP, current local mandi prices and storage costs. Use the price lab to evaluate one market and variety before considering a hold. The farmer makes the final sale decision.'})
  } catch(error){return replyError(error)}
})
