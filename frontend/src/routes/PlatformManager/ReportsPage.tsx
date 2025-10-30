import { useEffect, useState } from "react";
import "./ReportsPage.css";

type TrendRow = { date: string; total: number; Pending?: number; InProgress?: number; Completed?: number; Cancelled?: number };
type Summary = {
  totalRequests: number;
  byStatus: Record<string, number>;
  byServiceType: Record<string, number>;
  totalVolunteerHours: number;
  uniqueVolunteers: number;
  completionRate: number;
  averageTimeToComplete: number | null;
  trendDaily: TrendRow[];
};



type ActiveStats = { activePINs: number; activeCSRs: number };
type QuickBucket = { total: number; Pending: number; InProgress: number; Completed: number; Cancelled: number };
type QuickStats = { day: QuickBucket | null; week: QuickBucket | null; month: QuickBucket | null };

export default function ReportsPage() {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [active, setActive] = useState<ActiveStats | null>(null);
  
  const [quick, setQuick] = useState<QuickStats | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [dateRange, setDateRange] = useState<string>("");

  useEffect(() => {
    fetch("/api/service-types")
      .then(r => r.json())
      .then(d => setServiceTypes(d.serviceTypes || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/stats/active')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('stats failed')))
      .then(s => setActive(s))
      .catch(()=>{});
  }, []);

  useEffect(() => {
    fetch('/api/reports/quick')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('quick failed')))
      .then(d => setQuick(d))
      .catch(()=>{});
  }, []);

  // Simple display-only representation; actual picking uses DateRangePicker below
  function parseRange(val: string): [string, string] | null {
    const m = val.match(/^(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})$/);
    return m ? [m[1], m[2]] : null;
  }

  function syncDateRange(s: string, e: string) {
    setStart(s);
    setEnd(e);
    setDateRange(`${s} - ${e}`);
  }

  const onGenerate = async (s?: string, e?: string) => {
    setError(null);
    setSummary(null);
    let useStart = s ?? start;
    let useEnd = e ?? end;
    if (!s && !e && dateRange) {
      const p = parseRange(dateRange);
      if (p) { useStart = p[0]; useEnd = p[1]; syncDateRange(useStart, useEnd); }
    }
    if (!useStart || !useEnd) { setError("Invalid date range"); return; }
    setLoading(true);
    const params = new URLSearchParams();
    params.set("start", useStart);
    params.set("end", useEnd);
    if (selectedType) params.set("types", selectedType);
    try {
      const res = await fetch(`/api/reports/custom?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error occurred");
      setSummary(data);
    } catch (e: any) {
      setError(e.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Quick date helpers
  function fmt(d: Date) { return d.toISOString().slice(0,10); }
  function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d; }
  function endOfToday() { const d = new Date(); d.setHours(23,59,59,999); return d; }
  function startOfWeek() {
    const d = new Date();
    const day = d.getDay(); // 0=Sun..6=Sat
    const diff = (day === 0 ? -6 : 1 - day); // Monday start
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0); return d;
  }
  function endOfWeek() { const d = startOfWeek(); d.setDate(d.getDate() + 6); d.setHours(23,59,59,999); return d; }
  function startOfMonth() { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; }
  function endOfMonth() { const d = new Date(); d.setMonth(d.getMonth()+1, 0); d.setHours(23,59,59,999); return d; }
  function startOfYear() { const d = new Date(); d.setMonth(0,1); d.setHours(0,0,0,0); return d; }
  function endOfYear() { const d = new Date(); d.setMonth(11,31); d.setHours(23,59,59,999); return d; }

  const runQuick = (range: 'day'|'week'|'month'|'year') => {
    let s: Date, e: Date;
    if (range === 'day') { s = startOfToday(); e = endOfToday(); }
    else if (range === 'week') { s = startOfWeek(); e = endOfWeek(); }
    else if (range === 'month') { s = startOfMonth(); e = endOfMonth(); }
    else { s = startOfYear(); e = endOfYear(); }
    const sStr = fmt(s); const eStr = fmt(e);
    syncDateRange(sStr, eStr);
    onGenerate(sStr, eStr);
  };

  const onDownloadCsv = () => {
    if (!start || !end) { setError("Invalid date range"); return; }
    const params = new URLSearchParams();
    params.set("start", start);
    params.set("end", end);
    if (selectedType) params.set("types", selectedType);
    const urls = [
      `/api/reports/custom.csv?${params.toString()}`,
      `/api/reports/custom-data.csv?${params.toString()}`,
    ];
    // Trigger two downloads sequentially to avoid navigation replacement
    urls.forEach((u, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = u;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 250);
    });
  };

  return (
    <div className="pm-reports">
      <div className="cards" style={{marginBottom:12}}>
        <div className="card">
          <b>Today</b>
          <span>{quick?.day?.total ?? 0}</span>
          <button onClick={()=>runQuick('day')} disabled={loading}>Generate Daily Report</button>
        </div>
        <div className="card">
          <b>This Week</b>
          <span>{quick?.week?.total ?? 0}</span>
          <button onClick={()=>runQuick('week')} disabled={loading}>Generate Weekly Report</button>
        </div>
        <div className="card">
          <b>This Month</b>
          <span>{quick?.month?.total ?? 0}</span>
          <button onClick={()=>runQuick('month')} disabled={loading}>Generate Monthly Report</button>
        </div>
      </div>
      <h2>Platform Manager — Reports</h2>
      {!showCustomForm && (
        <div className="buttons" style={{marginBottom:12}}>
          <button onClick={() => setShowCustomForm(true)} disabled={loading}>Generate Custom Report</button>
        </div>
      )}
      <div className="form">
        {showCustomForm && (
          <label>
            Date range
            <DateRangePicker
              start={start}
              end={end}
              onChange={(s,e) => {
                syncDateRange(s,e);
              }}
            />
          </label>
        )}
        {showCustomForm && (<label>Service type
          <select value={selectedType} onChange={e=> setSelectedType(e.target.value)}>
            <option value="">All service types</option>
            {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>)}
        <div className="buttons" style={{ display: showCustomForm ? 'flex' : 'none' }}>
          <button onClick={() => onGenerate()} disabled={loading}>Generate Custom Report</button>
          <button onClick={onDownloadCsv} disabled={loading}>Download CSVs</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {summary && summary.totalRequests === 0 && <div className="empty">No data found</div>}

      {summary && summary.totalRequests > 0 && (
        <div className="results">
          <div className="cards">
            <div className="card"><b>Total</b><span>{summary.totalRequests}</span></div>
            <div className="card"><b>Completed</b><span>{summary.byStatus["Completed"] || 0}</span></div>
            <div className="card"><b>Unique Volunteers</b><span>{summary.uniqueVolunteers}</span></div>
            <div className="card"><b>Completion Rate</b><span>{(summary.completionRate*100).toFixed(1)}%</span></div>
            {active && <div className="card"><b>Active PINs</b><span>{active.activePINs}</span></div>}
            {active && <div className="card"><b>Active CSRs</b><span>{active.activeCSRs}</span></div>}
          </div>

          <h3>By Status</h3>
          <table className="simple">
            <thead><tr><th>Status</th><th>Count</th></tr></thead>
            <tbody>{Object.entries(summary.byStatus).map(([k,v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
          </table>

          <h3>By Service Type</h3>
          <table className="simple">
            <thead><tr><th>Service Type</th><th>Count</th></tr></thead>
            <tbody>{Object.entries(summary.byServiceType).map(([k,v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
          </table>

          <h3>Daily Trend</h3>
          <TrendChart data={summary.trendDaily} />
        </div>
      )}
    </div>
  );
}

// Single-calendar date range picker without external deps
function DateRangePicker({ start, end, onChange }: { start: string; end: string; onChange: (s: string, e: string) => void }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => (start ? new Date(start + 'T00:00:00').getFullYear() : new Date().getFullYear()));
  const [viewMonth, setViewMonth] = useState<number>(() => (start ? new Date(start + 'T00:00:00').getMonth() : new Date().getMonth()));
  const [selStart, setSelStart] = useState<Date | null>(() => (start ? new Date(start + 'T00:00:00') : null));
  const [selEnd, setSelEnd] = useState<Date | null>(() => (end ? new Date(end + 'T00:00:00') : null));
  const [hover, setHover] = useState<Date | null>(null);

  function toISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }

  function fmtLabel() {
    return start && end ? `${start} - ${end}` : 'Select range';
  }

  function daysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function startOfMonth(y: number, m: number) {
    return new Date(y, m, 1);
  }

  function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function isBetween(d: Date, a: Date, b: Date) {
    const t = d.getTime();
    const t0 = a.getTime();
    const t1 = b.getTime();
    return t >= Math.min(t0, t1) && t <= Math.max(t0, t1);
  }

  function onDayClick(d: Date) {
    if (!selStart || (selStart && selEnd)) {
      setSelStart(d);
      setSelEnd(null);
    } else {
      if (d.getTime() < selStart.getTime()) {
        // reset start to earlier date
        setSelStart(d);
        setSelEnd(null);
      } else if (d.getTime() === selStart.getTime()) {
        // single day range
        setSelEnd(d);
      } else {
        setSelEnd(d);
      }
    }
  }

  function apply() {
    if (selStart && selEnd) {
      onChange(toISO(selStart), toISO(selEnd));
      setOpen(false);
    }
  }

  function cancel() {
    setSelStart(start ? new Date(start + 'T00:00:00') : null);
    setSelEnd(end ? new Date(end + 'T00:00:00') : null);
    setHover(null);
    setOpen(false);
  }

  function prevMonth() {
    let y = viewYear;
    let m = viewMonth - 1;
    if (m < 0) { m = 11; y -= 1; }
    setViewYear(y); setViewMonth(m);
  }

  function nextMonth() {
    let y = viewYear;
    let m = viewMonth + 1;
    if (m > 11) { m = 0; y += 1; }
    setViewYear(y); setViewMonth(m);
  }

  const first = startOfMonth(viewYear, viewMonth);
  const offset = first.getDay(); // 0=Sun
  const dim = daysInMonth(viewYear, viewMonth);
  const cells: Array<Date | null> = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(new Date(viewYear, viewMonth, d));

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setOpen(o=>!o)}>{fmtLabel()}</button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 10, background: 'white', border: '1px solid #ccc', padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <button type="button" onClick={prevMonth}>{'<'}</button>
            <div style={{ fontWeight: 600 }}>{monthLabel}</div>
            <button type="button" onClick={nextMonth}>{'>'}</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)', gap: 4, textAlign: 'center', fontSize: 12, marginBottom: 4 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ opacity: 0.7 }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)', gap: 4 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const isStart = selStart && sameDay(d, selStart);
              const isEnd = selEnd && sameDay(d, selEnd);
              const inSelected = selStart && selEnd && isBetween(d, selStart, selEnd);
              const inHover = selStart && !selEnd && hover && isBetween(d, selStart, hover);
              const bg = isStart || isEnd ? '#2563eb' : (inSelected || inHover ? '#bfdbfe' : 'transparent');
              const color = isStart || isEnd ? 'white' : 'inherit';
              return (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover(d)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onDayClick(d)}
                  style={{
                    width: 32, height: 28, border: '1px solid #e5e7eb', borderRadius: 4,
                    background: bg, color, cursor: 'pointer'
                  }}
                >{d.getDate()}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={cancel}>Cancel</button>
            <button type="button" onClick={apply} disabled={!selStart || !selEnd}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendChart({ data }: { data: TrendRow[] }) {
  if (!data.length) return <div className="empty">No data</div>;
  const w = 600, h = 200, pad = 24;
  const xs = data.map((_, i) => i);
  const ys = data.map(d => d.total);
  const maxY = Math.max(...ys) || 1;
  const points = xs.map((x,i) => {
    const px = pad + (x/(xs.length-1||1))*(w-2*pad);
    const py = h - pad - (ys[i]/maxY)*(h-2*pad);
    return `${px},${py}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="chart">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2"/>
      {data.map((d,i) => {
        const px = pad + (i/(data.length-1||1))*(w-2*pad);
        return <text key={i} x={px} y={h-4} fontSize="10" textAnchor="middle">{d.date.slice(5)}</text>;
      })}
    </svg>
  );
}
