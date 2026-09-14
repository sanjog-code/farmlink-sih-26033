const corsHeaders={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Content-Type':'application/json',
}

const msp:Record<string,number>={
  Wheat:25.85,Barley:21.5,'Chickpea (Gram)':58.75,'Lentil (Masur)':70,'Rapeseed & mustard':62,Safflower:65.4,
  Maize:24,'Paddy (Common)':24.41,'Pearl millet (Bajra)':29.25,'Finger millet (Ragi)':52.05,'Sorghum (Jowar)':40.23,
  'Pigeon pea (Arhar/Tur)':82.5,'Green gram (Moong)':90.1,'Black gram (Urad)':82.5,Groundnut:79.26,Sesame:103.46,
  Sunflower:83.43,Soybean:53.28,Cotton:82.67,Jute:59.25,
}
const sources={
  cacp:'https://cacp.da.gov.in/',
  upag:'https://www.upag.gov.in/primary-estimate-report?tab=Prices',
  dfpd:'https://dfpd.gov.in/',
  pib:'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197711&reg=3&lang=2',
}
const json=(body:Record<string,unknown>,status=200)=>new Response(JSON.stringify(body),{status,headers:corsHeaders})

async function checkSource(url:string){
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(7000),headers:{'User-Agent':'FarmLink-SIH-market-advisory/1.0'}})
    return {reachable:response.ok,status:response.status,checkedAt:new Date().toISOString()}
  }catch{return {reachable:false,checkedAt:new Date().toISOString()}}
}

async function recentSales(crop:string){
  const projectUrl=Deno.env.get('SUPABASE_URL'),serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if(!projectUrl||!serviceKey)return {count:0,averagePrice:null,lastPrice:null}
  const endpoint=projectUrl+'/rest/v1/bulk_quotes?select=offered_price_per_kg,created_at,bulk_requests!inner(crop)&status=eq.accepted&bulk_requests.crop=eq.'+encodeURIComponent(crop)+'&order=created_at.desc&limit=20'
  try{
    const response=await fetch(endpoint,{headers:{apikey:serviceKey,Authorization:'Bearer '+serviceKey}})
    if(!response.ok)return {count:0,averagePrice:null,lastPrice:null}
    const rows=await response.json() as Array<{offered_price_per_kg:number}>
    const prices=rows.map(row=>Number(row.offered_price_per_kg)).filter(Number.isFinite)
    return {count:prices.length,averagePrice:prices.length?prices.reduce((sum,price)=>sum+price,0)/prices.length:null,lastPrice:prices[0]??null}
  }catch{return {count:0,averagePrice:null,lastPrice:null}}
}

Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
  if(request.method!=='POST')return json({error:'Method not allowed'},405)
  try{
    const body=await request.json().catch(()=>({})) as {crop?:string}
    const crop=String(body.crop||'Wheat')
    const [sales,sourceEntries]=await Promise.all([
      recentSales(crop),
      Promise.all(Object.entries(sources).map(async([name,url])=>[name,await checkSource(url)] as const)),
    ])
    const floor=Number(msp[crop]||0)
    const advice=sales.count===0
      ?(floor?'Hold for a farmer-approved offer at or above the MSP floor; there are no confirmed FarmLink sales for this crop yet.':'No MSP is notified for this crop and no confirmed FarmLink sale history is available; compare verified local mandi data before deciding.')
      :(floor&&Number(sales.averagePrice)<floor?'Hold: recent confirmed platform sales are below the MSP floor, so do not accept a below-floor offer.':`Consider selling only if the buyer offer meets your target: recent confirmed FarmLink sales average ₹${Number(sales.averagePrice).toFixed(2)}/kg.`)
    return json({crop,mspPerKg:floor,recentSales:sales,advice,sources:Object.fromEntries(sourceEntries),sourceNotes:{cacp:'MSP policy reference',upag:'official agriculture price reports',dfpd:'food policy and release reference',pib:'official MSP releases'}})
  }catch(error){return json({error:error instanceof Error?error.message:'Market advisory unavailable'},500)}
})
