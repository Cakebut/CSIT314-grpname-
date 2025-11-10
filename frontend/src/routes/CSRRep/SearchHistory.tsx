import { useEffect, useMemo, useState } from "react";
import "./SearchHistory.css";


function getCSRId() {
  const role = localStorage.getItem("currentRole");
  const userId = localStorage.getItem("userId");
  if (role === "CSR Rep" && userId) return userId;
  return null;
}

function SearchHistory() {
  type Status = "Pending" | "Completed";
  type HistoryRow = {
    name: string;
    date: string;
    location: string;
    type: string;
    status: Status;
  };
  const [DATA, setDATA] = useState<HistoryRow[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>(["All Types"]);
  const [svcType, setSvcType] = useState<string>("All Types");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  // Fetch service types from backend
  useEffect(() => {
    fetch('/api/csr/service-types')
      .then(res => res.json())
      .then(data => {
        setServiceTypes(["All Types", ...(data.serviceTypes || [])]);
      })
      .catch(() => setServiceTypes(["All Types"]));
  }, []);

  // Fetch real history from backend
  useEffect(() => {
    (async () => {
      const csrId = getCSRId();
      if (!csrId) return;
      try {
        const res = await fetch(`/api/csr/${csrId}/history`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        setDATA(json.history || []);
      } catch (e) {
        console.error("Failed to load CSR history", e);
        setDATA([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return DATA.filter(row => {
      const itype = svcType === "All Types" || row.type === svcType;
      const istart = !start || row.date >= start;
      const iend = !end || row.date <= end;
      return itype && istart && iend;
    });
  }, [DATA, svcType, start, end]);
  const totals = {
    total: filtered.length,
    pending: filtered.filter(r => r.status === "Pending").length,
    completed: filtered.filter(r => r.status === "Completed").length,
  };
  const clear = () => {
    setSvcType("All Types");
    setStart("");
    setEnd("");
  };
  const downloadCsv = () => {
    const rows = [
      ["Service Name", "Date", "Location", "Service Type", "Status"],
      ...filtered.map(r => [r.name, r.date, r.location, r.type, r.status]),
    ];
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `volunteer-service-history-${yyyy}-${mm}-${dd}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="search-history csr-page">
      <div className="search-history csr-header-row">
        <div className="search-history csr-header-left">
          <h2 className="search-history csr-section-title big">Search History</h2>
          <p className="search-history csr-muted">View and filter your completed volunteer service activities</p>
        </div>
        {/* download button moved into filter panel to sit at right of filter options */}
      </div>
      <div className="search-history csr-history-counters">
        <div className="search-history csr-offer-counter">Total Services <span>{totals.total}</span></div>
        <div className="search-history csr-offer-counter">Pending <span>{totals.pending}</span></div>
        <div className="search-history csr-offer-counter">Completed <span>{totals.completed}</span></div>
      </div>
      <h3 className="search-history csr-subtitle">Filter Options</h3>
      <div className="search-history csr-filters">
        <select className="search-history csr-select" value={svcType} onChange={e => setSvcType(e.target.value)}>
          {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="csr-history-start" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500, marginBottom: 2 }}>Start Date</label>
          <input
            id="csr-history-start"
            type="date"
            className="search-history csr-input"
            value={start}
            onChange={e => setStart(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="csr-history-end" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500, marginBottom: 2 }}>End Date</label>
          <input
            id="csr-history-end"
            type="date"
            className="search-history csr-input"
            value={end}
            onChange={e => setEnd(e.target.value)}
          />
        </div>
        <button className="search-history csr-btn" onClick={() => { /* live filtering */ }}>Apply Filter</button>
        <button className="search-history csr-btn-outline" style={{background : 'black', color : 'white'}} onClick={clear}>Clear Filter</button>
        <button className="search-history csr-btn search-history-download btn" onClick={downloadCsv}>Download History</button>
      </div>
      <h3 className="search-history csr-subtitle">Service Records</h3>
      <div className="search-history csr-table">
        <div className="search-history csr-thead">
          <div>Service Name</div>
          <div>Date</div>
          <div>Location</div>
          <div>Service Type</div>
          <div>Status</div>
        </div>
        {filtered.map((r, i) => (
          <div key={i} className="search-history csr-trow">
            <div>{r.name}</div>
            <div>{r.date}</div>
            <div>{r.location}</div>
            <div>{r.type}</div>
            <div>{r.status}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="search-history csr-empty">No records for given filters.</div>
        )}
      </div>
    </div>
  );
}

export default SearchHistory;