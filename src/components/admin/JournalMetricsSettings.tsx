'use client';

import {useEffect,useState} from 'react';
import {getAdminJournalMetrics,setJournalMetricsEnabled,refreshJournalMetrics,type JournalMetrics,type JournalIndicator} from '@/services/journalMetricsService';

export default function JournalMetricsSettings() {
  const [metrics,setMetrics]=useState<JournalMetrics|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  useEffect(()=>{
    let active=true;
    let pending=false;
    const load=async()=>{
      if(pending) return;
      pending=true;
      try { const result=await getAdminJournalMetrics(); if(active) setMetrics(result); }
      catch { if(active) setMessage('Could not load metrics. Retrying automatically.'); }
      finally {pending=false;}
    };
    void load();
    const interval=window.setInterval(()=>void load(),5000);
    return ()=>{active=false;window.clearInterval(interval);};
  },[]);
  const toggle=async()=>{
    if(!metrics || busy) return;
    setBusy(true);setMessage('');
    try {const updated=await setJournalMetricsEnabled(!metrics.enabled);setMetrics(updated);setMessage(updated.enabled?'Automatic metrics enabled. Refresh requested.':'Automatic metrics disabled. Both public cards now show 0.0.');}
    catch {setMessage('Could not save the setting. Please retry.');}
    finally {setBusy(false);}
  };
  const refresh=async()=>{
    setBusy(true);setMessage('');
    try {await refreshJournalMetrics();setMetrics(await getAdminJournalMetrics());setMessage('Refresh requested. Progress updates automatically.');}
    catch {setMessage('Could not request refresh. Please retry.');}
    finally {setBusy(false);}
  };
  const [onlyMissing,setOnlyMissing]=useState(false);
  const renderIndicators=(period:{year:number;citeScore:JournalIndicator;impactFactor:JournalIndicator})=><div className="mt-3 grid gap-4 sm:grid-cols-2">
    {[{label:'CiteScore estimate',metric:period.citeScore,window:`${period.year-3}–${period.year}`},{label:'Impact Factor estimate',metric:period.impactFactor,window:`${period.year-2}–${period.year-1}; citations in ${period.year}`}].map(({label,metric,window})=><div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-700">{label} · {period.year}</p><p className="mt-2 text-3xl font-bold text-slate-950">{metric.value}</p><p className="mt-2 text-xs text-slate-600">{window}</p>
      <p className="mt-2 text-sm text-slate-700">{metric.citations} observed citations / {metric.publications} citable publications</p>
      <p className="mt-1 text-xs text-slate-500">Matched: {metric.matched}/{metric.expected} records{metric.complete===false?' · Incomplete coverage':''}{!!metric.partial&&` · ${metric.partial} fallback record(s)`}</p>
      {metric.complete===false&&metric.observedValue&&metric.observedValue!=='N/A'&&<p className="mt-2 text-xs text-amber-700">Observed-only estimate: {metric.observedValue} (not a verified complete score)</p>}
    </div>)}
  </div>;
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-lg font-bold text-slate-950">Automatic Journal Metrics</h2><p className="mt-1 text-sm text-slate-500">Independent estimates based on dated citations and published CMS articles (OpenAlex with OpenCitations fallback). Not official Scopus or Clarivate scores.</p></div>
      <button type="button" role="switch" aria-checked={metrics?.enabled??false} aria-label="Automatic journal metrics" disabled={!metrics||busy} onClick={()=>void toggle()} className={`rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50 ${metrics?.enabled?'bg-[#005A78] text-white':'border border-slate-300 bg-slate-100 text-slate-700'}`}>{metrics ? (metrics.enabled?'Enabled':'Disabled'):'Loading…'}</button>
    </div>
    <p className="mt-3 text-sm text-slate-600">The switch saves immediately. Disabling shows 0.0 in both public cards without deleting citation history. Synchronizes every 24 hours while enabled.</p>
    {metrics && <>
      <h3 className="mt-5 text-sm font-bold text-slate-800">Completed year · {metrics.year} (public cards)</h3>
      {renderIndicators(metrics)}
      {metrics.live&&<><h3 className="mt-6 text-sm font-bold text-slate-800">Live tracker · {metrics.live.year} (year to date, admin only)</h3>{renderIndicators(metrics.live)}</>}
      <p className="mt-3 text-xs text-slate-500">Incomplete coverage is shown as N/A on the public cards. Lifetime citations are provided for comparison only; they are never substituted for annual citations. The fallback uses dated citing records and is not added to OpenAlex totals.</p>
      <div className="mt-4 space-y-1 text-sm text-slate-600">
        <p>Last successful article lookup: {metrics.lastSyncedAt?new Date(metrics.lastSyncedAt).toLocaleString():'Not yet synchronized'}</p>
        {metrics.oldestSyncedAt && <p>Oldest cached lookup: {new Date(metrics.oldestSyncedAt).toLocaleString()}</p>}
        {metrics.unknownYear>0 && <p className="text-amber-700">{metrics.unknownYear} published record(s) have no identifiable publication year and were excluded.</p>}
        {metrics.duplicateRecords>0 && <p>{metrics.duplicateRecords} duplicate record(s) excluded.</p>}
        {metrics.lastRun && <p>{metrics.lastRun.message} Matched: {metrics.lastRun.matched}; unmatched: {metrics.lastRun.unmatched}; errors: {metrics.lastRun.errors}.</p>}
      </div>
      <button type="button" disabled={busy||metrics.running||!metrics.enabled} onClick={()=>void refresh()} className="mt-4 rounded-xl border border-[#005A78] px-4 py-2.5 text-sm font-bold text-[#005A78] disabled:opacity-50">{metrics.running?'Synchronizing…':'Refresh citations now'}</button>
      {metrics.articles&&<details className="mt-5 rounded-2xl border border-slate-200 p-4">
        <summary className="cursor-pointer text-sm font-bold text-slate-800">Article citation diagnostics ({metrics.articles.length} records)</summary>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={onlyMissing} onChange={e=>setOnlyMissing(e.target.checked)}/> Show only unmatched or fallback records</label>
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[780px] text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-600"><th className="p-2">Article / DOI</th><th className="p-2">Year</th><th className="p-2">Annual source / status</th><th className="p-2">Annual citations</th><th className="p-2">Lifetime (CMS)</th></tr></thead><tbody>
          {metrics.articles.filter(a=>!onlyMissing||a.source!=='OpenAlex').map(a=><tr key={a.id} className="border-b border-slate-100 align-top"><td className="max-w-sm p-2"><p className="font-semibold text-slate-800">{a.title}</p><p className="mt-1 break-all text-slate-500">{a.doi||'No DOI in CMS'}</p>{a.resolvedDoi&&a.resolvedDoi!==a.doi&&<p className="break-all text-slate-500">Resolved DOI: {a.resolvedDoi}</p>}</td><td className="p-2">{a.year}</td><td className="p-2"><p className={a.source==='OpenAlex'?'text-emerald-700':'text-amber-700'}>{a.source||'Unmatched'}{a.retracted?' · Retracted':''}</p><p>{a.method}</p>{a.note&&<p className="text-slate-500">{a.note}</p>}{a.fetchedAt&&<p className="text-slate-500">{new Date(a.fetchedAt).toLocaleString()}</p>}</td><td className="p-2">{a.source?(a.counts.length?[...a.counts].sort((x,y)=>x.year-y.year).map(c=><div key={c.year}>{c.year}: {c.citedByCount}</div>):'No citations recorded'):'Unknown'}</td><td className="p-2">{a.lifetimeCitations} ({a.lifetimeSource})</td></tr>)}
        </tbody></table>{!metrics.articles.filter(a=>!onlyMissing||a.source!=='OpenAlex').length&&<p className="p-3 text-slate-500">No records to display.</p>}</div>
      </details>}
    </>}
    {message && <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>}
  </section>;
}
