import { useEffect, useState, useRef } from "react";
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import "./ReportsPage.css";

type TrendRow = { date: string; total: number; Pending?: number; Completed?: number; Cancelled?: number };
type Summary = {
  totalRequests: number;
  byStatus: Record<string, number>;
  byServiceType: Record<string, number>;
  totalVolunteerHours: number;
  uniqueVolunteers: number;
  completionRate: number;
  averageTimeToComplete: number | null;
  trendDaily: TrendRow[];
  activePINs: number;
  activeCSRs: number;
};



// Removed unused ActiveStats type
type QuickBucket = { total: number; Pending: number; Completed: number; Cancelled: number };
type QuickStats = { day: QuickBucket | null; week: QuickBucket | null; month: QuickBucket | null };

export default function ReportsPage() {
  
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  // Removed unused active state
  
  const [quick, setQuick] = useState<QuickStats | null>(null);
  const [dateRange, setDateRange] = useState<string>("");
  

  useEffect(() => {
    fetch("/api/pm/service-types")
      .then(r => r.json())
      .then(d => setServiceTypes(d.serviceTypes || []))
      .catch(() => {});
  }, []);

  // Removed unused active stats fetch

  useEffect(() => {
    // Fetch quick stats based on the client's local calendar (so the UI "Today" matches the user's local day)
    async function loadQuick() {
      try {
        const today = fmt(new Date());
        const dayRes = await fetch(`/api/pm/reports/custom?start=${today}&end=${today}`);
        const dayJson = await dayRes.json();
        const dayTotal = dayRes.ok ? (dayJson.totalRequests ?? 0) : 0;

        const weekStart = fmt(startOfWeek());
        const weekEnd = fmt(endOfWeek());
        const weekRes = await fetch(`/api/pm/reports/custom?start=${weekStart}&end=${weekEnd}`);
        const weekJson = await weekRes.json();
        const weekTotal = weekRes.ok ? (weekJson.totalRequests ?? 0) : 0;

        const monthStart = fmt(startOfMonth());
        const monthEnd = fmt(endOfMonth());
        const monthRes = await fetch(`/api/pm/reports/custom?start=${monthStart}&end=${monthEnd}`);
        const monthJson = await monthRes.json();
        const monthTotal = monthRes.ok ? (monthJson.totalRequests ?? 0) : 0;

  setQuick({ day: { total: Number(dayTotal), Pending: 0, Completed: 0, Cancelled: 0 },
       week: { total: Number(weekTotal), Pending: 0, Completed: 0, Cancelled: 0 },
       month: { total: Number(monthTotal), Pending: 0, Completed: 0, Cancelled: 0 } });
      } catch {
        // ignore
      }
    }
    loadQuick();
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

  const onGenerate = async (s?: string, e?: string, opts?: { ignoreType?: boolean }) => {
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
    if (!opts?.ignoreType && selectedType) params.set("types", selectedType);
    try {
      const res = await fetch(`/api/pm/reports/custom?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error occurred");
      setSummary(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || "Error occurred");
      } else {
        setError("Error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick date helpers
  function fmt(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
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
  // Removed unused startOfYear and endOfYear functions

  function runQuickRange(s: Date, e: Date) {
    const sStr = fmt(s);
    const eStr = fmt(e);
    syncDateRange(sStr, eStr);
    onGenerate(sStr, eStr, { ignoreType: true });
  }

  const runQuickDay = () => runQuickRange(startOfToday(), endOfToday());
  const runQuickWeek = () => runQuickRange(startOfWeek(), endOfWeek());
  const runQuickMonth = () => runQuickRange(startOfMonth(), endOfMonth());

  const onDownloadCsv = () => {
    if (!start || !end) { setError("Invalid date range"); return; }
    const params = new URLSearchParams();
    params.set("start", start);
    params.set("end", end);
    if (selectedType) params.set("types", selectedType);
    const urls = [
      `/api/pm/reports/custom.csv?${params.toString()}`,
      `/api/pm/reports/custom-data.csv?${params.toString()}`,
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
    <div style={{ padding: 25 }}>
      <div className="pm-announce-header" style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="pm-announce-title">Download Report</div>
          <div className="pm-announce-sub">Generate your reports and data analytics here</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn" onClick={onDownloadCsv} disabled={loading}>Download CSVs</button>
        </div>
      </div>
    <div className="pm-reports">
      <div className="cards" style={{marginBottom:12}}>
        <div className="card">
          <b>Today</b>
          <span>{quick?.day?.total ?? 0}</span>
          <button onClick={runQuickDay} disabled={loading}>Generate Daily Report</button>
        </div>
        <div className="card">
          <b>This Week</b>
          <span>{quick?.week?.total ?? 0}</span>
          <button onClick={runQuickWeek} disabled={loading}>Generate Weekly Report</button>
        </div>
        <div className="card">
          <b>This Month</b>
          <span>{quick?.month?.total ?? 0}</span>
          <button onClick={runQuickMonth} disabled={loading}>Generate Monthly Report</button>
        </div>
        <div className="card">
          <b>Custom Report</b>
          <div
            className="form"
            style={{
              marginTop: 8,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              minHeight: 140,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'block' }}>
                Date range
                <div style={{ marginTop: 8 }}>
                  <DateRangePicker start={start} end={end} onChange={(s, e) => { syncDateRange(s, e); }} />
                </div>
              </label>
              <label style={{ display: 'block' }}>
                Service type
                <div style={{ marginTop: 8 }}>
                  <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                    <option value="">All service types</option>
                    {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div />
              <div className="buttons">
                <button onClick={() => onGenerate()} disabled={loading}>Generate Custom Report</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {error && <div className="error">{error}</div>}
      {summary && summary.totalRequests === 0 && <div className="empty">No data found</div>}

      {summary && summary.totalRequests > 0 && (
        <div className="results" style={{ marginTop: 50 }}>
          <div className="cards">
            <div className="card highlight"><b>Total Requests</b><span>{summary.totalRequests}</span></div>
            <div className="card"><b>Completed</b><span>{summary.byStatus["Completed"] || 0}</span></div>
            <div className="card"><b>Unique Volunteers</b><span>{summary.uniqueVolunteers}</span></div>
            <div className="card"><b>Completion Rate</b><span>{(summary.completionRate*100).toFixed(1)}%</span></div>
            <div className="card highlight"><b>Active PINs</b><span>{summary.activePINs ?? 0}</span></div>
            <div className="card highlight"><b>Active CSRs</b><span>{summary.activeCSRs ?? 0}</span></div>
          </div>

          <h3 style={{ marginTop: 30 }}>By Status</h3>
          <table className="simple" style={{ marginBottom: 30 }}>
            <thead><tr><th>Status</th><th>Count</th></tr></thead>
            <tbody>{Object.entries(summary.byStatus).map(([k,v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
          </table>

          <h3>By Service Type</h3>
          <table className="simple">
            <thead><tr><th>Service Type</th><th>Count</th></tr></thead>
            <tbody>{Object.entries(summary.byServiceType).map(([k,v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
          </table>
          <div style={{ marginTop: 30 }}>
            <h2 style={{ marginBottom: 30, textAlign: 'center' }}>Visualizations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <b>Requests by Status (Pie)</b>
                <PieChart
                  data={Object.entries(summary.byStatus).map(([label, value], i) => ({ label, value: Number(value), color: palette[i % palette.length] }))}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <b>Requests by Service Type (Vertical)</b>
                <BarChartVertical
                  data={Object.entries(summary.byServiceType).map(([label, value], i) => ({ label, value: Number(value), color: palette[i % palette.length] }))}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <b>Requests by Status (Horizontal)</b>
                <BarChartHorizontal
                  data={Object.entries(summary.byStatus).map(([label, value], i) => ({ label, value: Number(value), color: palette[i % palette.length] }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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
  const justClosedRef = useRef<number | null>(null);

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
      const s = toISO(selStart);
      const e = toISO(selEnd);
      // close first so the UI responds immediately
      setOpen(false);
      // mark recent close so toggle doesn't immediately re-open
      justClosedRef.current = Date.now();
      setTimeout(() => { justClosedRef.current = null; }, 450);
      // call parent's onChange asynchronously so it can't block the close
      Promise.resolve().then(() => onChange(s, e)).catch((err: any) => {
        console.error('DateRangePicker onChange error', err);
      });
    }
  }

  // canceled selection not used in current UI; keep logic here in case we re-add a Cancel button

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
      <button type="button" onClick={() => {
        if (justClosedRef.current && (Date.now() - justClosedRef.current) < 450) { justClosedRef.current = null; return; }
        setOpen(o=>!o);
      }}>{fmtLabel()}</button>
      {open && (
        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ position: 'absolute', zIndex: 10, background: 'white', border: '1px solid #ccc', padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
            <button type="button" onClick={(e) => { e.stopPropagation(); apply(); }} disabled={!selStart || !selEnd}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

// function TrendChart({ data }: { data: TrendRow[] }) {
//   if (!data.length) return <div className="empty">No data</div>;
//   const w = 600, h = 200, pad = 24;
//   const xs = data.map((_, i) => i);
//   const ys = data.map(d => d.total);
//   const maxY = Math.max(...ys) || 1;
//   const points = xs.map((x,i) => {
//     const px = pad + (x/(xs.length-1||1))*(w-2*pad);
//     const py = h - pad - (ys[i]/maxY)*(h-2*pad);
//     return `${px},${py}`;
//   }).join(" ");
//   return (
//     <svg width={w} height={h} className="chart">
//       <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2"/>
//       {data.map((d,i) => {
//         const px = pad + (i/(data.length-1||1))*(w-2*pad);
//         return <text key={i} x={px} y={h-4} fontSize="10" textAnchor="middle">{d.date.slice(5)}</text>;
//       })}
//     </svg>
//   );
// }

type ChartDatum = { label: string; value: number; color?: string };
// neutral, muted palette for charts
const palette = [
  '#475569', // slate-600
  '#64748b', // slate-500
  '#94a3b8', // slate-400
  '#cbd5e1', // slate-200
  '#e6eef8', // very light blue
  '#9ca3af', // gray-400
  '#d1d5db', // gray-300
  '#f1f5f9', // gray-100
  '#e2e8f0', // gray-200
  '#c7d2e8', // muted blue
];

function PieChart({ data }: { data: ChartDatum[] }) {
  const sized = Math.max(220, Math.min(380, data.length * 30 + 110));
  return (
    <div style={{ width: '100%', height: sized }}>
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={Math.floor(sized / 3)}
            labelLine={false}
            label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color || palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarChartVertical({ data }: { data: ChartDatum[] }) {
  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} layout="horizontal" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <XAxis dataKey="label" type="category" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color || palette[i % palette.length]} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarChartHorizontal({ data }: { data: ChartDatum[] }) {
  const height = Math.max(200, data.length * 36 + 80);
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 10 }}>
          <XAxis type="number" />
          <YAxis dataKey="label" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="value">{data.map((d, i) => <Cell key={i} fill={d.color || palette[i % palette.length]} />)}</Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
