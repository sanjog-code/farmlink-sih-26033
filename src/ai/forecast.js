// Free statistical baseline trained per market/commodity/variety series.
export function fitTrend(rows, horizon = 7) {
  const grouped = new Map();
  for (const row of rows) {
    const time = Date.parse(row.date);
    const price = Number(row.price);
    if (!Number.isFinite(time) || !Number.isFinite(price) || price <= 0) throw new Error('Every observation needs a valid date and positive INR/kg price.');
    const date = new Date(time).toISOString().slice(0,10);
    if (grouped.has(date)) throw new Error('Use one observation per date for the same market and variety.');
    grouped.set(date,price);
  }
  const series = [...grouped].sort(([a],[b])=>a.localeCompare(b)).map(([date,price])=>({date,price}));
  if (series.length < 21) throw new Error('Add at least 21 dated observations from one market and variety.');
  const train = values => {
    const base=Date.parse(values[0].date);
    const xs=values.map(v=>(Date.parse(v.date)-base)/86400000);
    const mx=xs.reduce((a,b)=>a+b,0)/xs.length;
    const my=values.reduce((a,b)=>a+b.price,0)/values.length;
    const slope=values.reduce((s,v,i)=>s+(xs[i]-mx)*(v.price-my),0)/xs.reduce((s,x)=>s+(x-mx)**2,0);
    return date=>my+slope*((Date.parse(date)-base)/86400000-mx);
  };
  const cut=series.length-7, predictTest=train(series.slice(0,cut));
  const test=series.slice(cut);
  const mae=test.reduce((s,v)=>s+Math.abs(v.price-predictTest(v.date)),0)/test.length;
  const naiveMae=test.reduce((s,v)=>s+Math.abs(v.price-series[cut-1].price),0)/test.length;
  const latest=series.at(-1);
  const date=new Date(Date.parse(latest.date)+horizon*86400000).toISOString().slice(0,10);
  const predicted=train(series)(date);
  if (!Number.isFinite(predicted) || predicted<=0) throw new Error('This trend cannot produce a valid positive forecast.');
  return {predicted,date,latest,mae,naiveMae,beatsNaive:mae<naiveMae,observations:series.length,method:'Linear trend; last 7 observations held out for evaluation'};
}

export function parsePriceCsv(text) {
  const lines=text.trim().split(/\r?\n/);
  if(lines.shift()?.trim().toLowerCase()!=='date,price') throw new Error('CSV header must be date,price. Prices must be INR/kg.');
  return lines.filter(l=>l.trim()).map(line=>{
    const fields=line.split(',');
    if(fields.length!==2 || !/^\d{4}-\d{2}-\d{2}$/.test(fields[0].trim())) throw new Error('Use YYYY-MM-DD,price for each row.');
    const date=fields[0].trim();
    if(!Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date) throw new Error('Invalid calendar date.');
    if(Date.parse(date)>Date.now()) throw new Error('Historical observations cannot be future dates.');
    return {date,price:Number(fields[1])};
  });
}
