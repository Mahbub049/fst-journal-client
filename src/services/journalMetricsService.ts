import api from '@/lib/api';

export type JournalIndicator = { value: string; citations: number; publications: number; matched: number; expected: number; observedValue?: string; partial?: number; complete?: boolean };
export type MetricArticle = { id:string; title:string; year:number; doi:string; resolvedDoi:string; source:string|null; method:string; workId:string; counts:{year:number;citedByCount:number}[]; fetchedAt:string|null; lifetimeCitations:number; lifetimeSource:string; note:string; retracted:boolean };
export type JournalMetrics = {
  live?: {year:number;citeScore:JournalIndicator;impactFactor:JournalIndicator}; articles?:MetricArticle[];
  enabled: boolean; year: number; citeScore: JournalIndicator; impactFactor: JournalIndicator;
  unknownYear: number; duplicateRecords: number; running: boolean;
  lastSyncedAt: string | null; oldestSyncedAt: string | null;
  lastRun: { finishedAt: string; matched: number; unmatched: number; errors: number; message: string } | null;
};
export async function getJournalMetrics(): Promise<JournalMetrics> {
  const {data} = await api.get('/homepage/journal-metrics'); return data.metrics;
}
export async function getAdminJournalMetrics(): Promise<JournalMetrics> {
  const {data} = await api.get('/homepage/admin/journal-metrics'); return data.metrics;
}
export async function setJournalMetricsEnabled(enabled: boolean): Promise<JournalMetrics> {
  const {data} = await api.put('/homepage/admin/journal-metrics',{enabled}); return data.metrics;
}
export async function refreshJournalMetrics(): Promise<void> {
  await api.post('/homepage/admin/journal-metrics/refresh');
}
