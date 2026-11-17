'use client';

import {useEffect,useState} from 'react';
import {getJournalMetrics,setJournalMetricsEnabled,refreshJournalMetrics,type JournalMetrics} from '@/services/journalMetricsService';

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
      try { const result=await getJournalMetrics(); if(active) setMetrics(result); }
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
    try {await refreshJournalMetrics();setMetrics(await getJournalMetrics());setMessage('Refresh requested. Progress updates automatically.');}
    catch {setMessage('Could not request refresh. Please retry.');}
    finally {setBusy(false);}
  };
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-lg font-bold text-slate-950">Automatic Journal Metrics</h2><p className="mt-1 text-sm text-slate-500">Independent estimates based on OpenAlex annual citations and published CMS articles. Not official Scopus or Clarivate scores.</p></div>
      <button type="button" role="switch" aria-checked={metrics?.enabled??false} aria-label="Automatic journal metrics" disabled={!metrics||busy} onClick={()=>void toggle()} className={`rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50 ${metrics?.enabled?'bg-[#005A78] text-white':'border border-slate-300 bg-slate-100 text-slate-700'}`}>{metrics ? (metrics.enabled?'Enabled':'Disabled'):'Loading…'}</button>
    </div>
    <p className="mt-3 text-sm text-slate-600">The switch saves immediately. Disabling shows 0.0 in both public cards without deleting citation history. Synchronizes every 24 hours while enabled.</p>
    {metrics && <>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[{label:'CiteScore estimate',metric:metrics.citeScore,window:`${metrics.year-3}–${metrics.year}`},{label:'Impact Factor estimate',metric:metrics.impactFactor,window:`${metrics.year-2}–${metrics.year-1}; citations in ${metrics.year}`}].map(({label,metric,window})=><div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-700">{label} · {metrics.year}</p><p className="mt-2 text-3xl font-bold text-slate-950">{metric.value}</p><p className="mt-2 text-xs text-slate-600">{window}</p><p className="mt-2 text-sm text-slate-700">{metric.citations} citations / {metric.publications} citable publications</p><p className="mt-1 text-xs text-slate-500">Matched: {metric.matched}/{metric.expected} records{metric.matched<metric.expected?' · Incomplete coverage':''}</p></div>)}
      </div>
      <div className="mt-4 space-y-1 text-sm text-slate-600">
        <p>Last successful article lookup: {metrics.lastSyncedAt?new Date(metrics.lastSyncedAt).toLocaleString():'Not yet synchronized'}</p>
        {metrics.oldestSyncedAt && <p>Oldest cached lookup: {new Date(metrics.oldestSyncedAt).toLocaleString()}</p>}
        {metrics.unknownYear>0 && <p className="text-amber-700">{metrics.unknownYear} published record(s) have no identifiable publication year and were excluded.</p>}
        {metrics.duplicateRecords>0 && <p>{metrics.duplicateRecords} duplicate record(s) excluded.</p>}
        {metrics.lastRun && <p>{metrics.lastRun.message} Matched: {metrics.lastRun.matched}; unmatched: {metrics.lastRun.unmatched}; errors: {metrics.lastRun.errors}.</p>}
      </div>
      <button type="button" disabled={busy||metrics.running||!metrics.enabled} onClick={()=>void refresh()} className="mt-4 rounded-xl border border-[#005A78] px-4 py-2.5 text-sm font-bold text-[#005A78] disabled:opacity-50">{metrics.running?'Synchronizing…':'Refresh citations now'}</button>
    </>}
    {message && <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>}
  </section>;
}
