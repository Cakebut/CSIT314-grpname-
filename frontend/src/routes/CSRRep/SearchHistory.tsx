import React, { useEffect, useMemo, useState } from 'react';



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
    <div className="csr-page">
      <div className="csr-subnav">
        <button className="csr-btn" onClick={downloadCsv} style={{ marginLeft: "auto" }}>
          Download History
        </button>
      </div>
      <h2 className="csr-section-title big">Search History</h2>
      <p className="csr-muted">View and filter your completed volunteer service activities</p>
      <div className="csr-history-counters">
        <div className="csr-offer-counter">Total Services <span>{totals.total}</span></div>
        <div className="csr-offer-counter">Pending <span>{totals.pending}</span></div>
        <div className="csr-offer-counter">Completed <span>{totals.completed}</span></div>
      </div>
      <h3 className="csr-subtitle">Filter Options</h3>
      <div className="csr-filters">
        <select className="csr-select" value={svcType} onChange={e => setSvcType(e.target.value)}>
          {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="csr-history-start" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500, marginBottom: 2 }}>Start Date</label>
          <input
            id="csr-history-start"
            type="date"
            className="csr-input"
            value={start}
            onChange={e => setStart(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="csr-history-end" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500, marginBottom: 2 }}>End Date</label>
          <input
            id="csr-history-end"
            type="date"
            className="csr-input"
            value={end}
            onChange={e => setEnd(e.target.value)}
          />
        </div>
        <button className="csr-btn" onClick={() => { /* live filtering */ }}>Apply Filter</button>
        <button className="csr-btn-outline" onClick={clear}>Clear Filter</button>
      </div>
      <h3 className="csr-subtitle">Service Records</h3>
      <div className="csr-table">
        <div className="csr-thead">
          <div>Service Name</div>
          <div>Date</div>
          <div>Location</div>
          <div>Service Type</div>
          <div>Status</div>
        </div>
        {filtered.map((r, i) => (
          <div key={i} className="csr-trow">
            <div>{r.name}</div>
            <div>{r.date}</div>
            <div>{r.location}</div>
            <div>{r.type}</div>
            <div>{r.status}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="csr-empty">No records for given filters.</div>
        )}
      </div>
    </div>
  );
}

export default SearchHistory;