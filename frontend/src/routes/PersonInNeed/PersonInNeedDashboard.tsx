import React, { useEffect, useState, useMemo } from 'react';
import './PersonInNeedDashboard.css';

/* Inline types previously in types.ts */
type PINRequestStatus = 'open' | 'in-progress' | 'fulfilled' | 'cancelled';

interface PINRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  location?: string;
  createdBy?: {
    id: string;
    name: string;
  };
  needsTransportation?: boolean;
  needsWheelchair?: boolean;
  status: PINRequestStatus;
  createdAt: string;
  updatedAt?: string;
}

/* Simple fetch client pointing to localhost:3000 */
const API_BASE = 'http://localhost:3000';

async function fetchPINRequests(params: {
  page?: number;
  perPage?: number;
  category?: string;
  status?: string;
  q?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
} = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.perPage) query.set('perPage', String(params.perPage));
  if (params.category) query.set('category', params.category);
  if (params.status) query.set('status', params.status);
  if (params.q) query.set('q', params.q);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortDir) query.set('sortDir', params.sortDir);
  const res = await fetch(`${API_BASE}/pin-requests?${query.toString()}`, {
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to fetch requests: ${res.statusText}`);
  return res.json() as Promise<{ items: PINRequest[]; total: number; page: number; perPage: number }>;
}

async function claimRequest(id: string) {
  const res = await fetch(`${API_BASE}/pin-requests/${encodeURIComponent(id)}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to claim request: ${res.statusText}`);
  return res.json();
}

type SortOption = 'createdAt' | 'updatedAt' | 'title';

export default function PINRequestsPage() {
  const [items, setItems] = useState<PINRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchPINRequests({
      page,
      perPage,
      category: category || undefined,
      status: status || undefined,
      q: q || undefined,
      sortBy,
      sortDir,
    })
      .then(res => {
        if (!active) return;
        setItems(res.items || []);
        setTotal(res.total ?? 0);
      })
      .catch(err => {
        if (!active) return;
        setError(err.message || 'Failed to load requests');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, perPage, category, status, q, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const categories = useMemo(() => {
    return ['Medical Assistance', 'Mobility & Accessibility', 'Daily Living Support', 'Companionship', 'Administrative & Financial'];
  }, []);

  function fmtDate(iso?: string) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString();
  }

  async function handleClaim(id: string) {
    try {
      setClaimingId(id);
      await claimRequest(id);
      // optimistic refresh of list
      const refreshed = await fetchPINRequests({ page, perPage, category: category || undefined, status: status || undefined, q: q || undefined, sortBy, sortDir });
      setItems(refreshed.items || []);
      setTotal(refreshed.total ?? 0);
    } catch (err: any) {
      setError(err.message || 'Failed to claim');
    } finally {
      setClaimingId(null);
    }
  }

  return (
  <div className="container">
  <div className="header">
        <div>
          <h3>PIN Requests</h3>
    <div className="small">All requests created by PIN accounts</div>
        </div>

  <div className="filters">
          <div className="controls">
            <input placeholder="Search title or description" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
              <option value="createdAt">Newest</option>
              <option value="updatedAt">Recently Updated</option>
              <option value="title">Title</option>
            </select>
            <select value={sortDir} onChange={e => setSortDir(e.target.value as 'asc' | 'desc')}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

            <button className="button" onClick={() => { setCategory(''); setStatus(''); setQ(''); setPage(1); }}>Reset</button>
          </div>

          <div>
            <button className={`button ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>Table</button>
            <button className={`button ${view === 'cards' ? 'active' : ''}`} onClick={() => setView('cards')}>Cards</button>
          </div>
        </div>
      </div>

  {loading && <div className="empty">Loading requests…</div>}
  {error && <div className="empty">Error: {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="empty">No requests match your filters</div>
      )}

      {!loading && !error && items.length > 0 && view === 'table' && (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Details</th>
              <th>Location</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id}>
                <td>
                  <div><strong>{r.title}</strong></div>
                  <div className="row-muted">{r.id}</div>
                </td>
                <td>{r.category}</td>
                <td>
                  <div className="small">{r.description}</div>
                  <div className="row-muted">
                    {r.needsWheelchair ? 'Needs wheelchair; ' : ''}{r.needsTransportation ? 'Needs transport' : ''}
                  </div>
                </td>
                <td>{r.location || '-'}</td>
                <td>{r.createdBy?.name || 'Unknown'}</td>
                <td>
                  <span className={`badge ${r.status}`}>{r.status.replace('-', ' ')}</span>
                </td>
                <td className="row-muted">{fmtDate(r.createdAt)}</td>
                <td>
                  <div style={{display:'flex', gap:8}}>
                    <button className="button" onClick={() => alert(JSON.stringify(r, null, 2))}>View</button>
                    <button
                      className="button"
                      onClick={() => handleClaim(r.id)}
                      disabled={r.status !== 'open' || claimingId === r.id}
                    >
                      {claimingId === r.id ? 'Claiming…' : 'Claim'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && items.length > 0 && view === 'cards' && (
        <div className="card-grid">
          {items.map(r => (
            <div className="card" key={r.id}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                <strong>{r.title}</strong>
                <span className={`badge ${r.status}`}>{r.status.replace('-', ' ')}</span>
              </div>
              <div className="small">{r.category} · {r.createdBy?.name}</div>
              <div style={{marginTop:8, marginBottom:8}}>{r.description}</div>
              <div className="row-muted">Location: {r.location || '—'}</div>
              <div className="row-muted">Created: {fmtDate(r.createdAt)}</div>
              <div style={{marginTop:10, display:'flex', gap:8}}>
                <button className="button" onClick={() => alert(JSON.stringify(r, null, 2))}>View</button>
                <button
                  className="button"
                  onClick={() => handleClaim(r.id)}
                  disabled={r.status !== 'open' || claimingId === r.id}
                >
                  {claimingId === r.id ? 'Claiming…' : 'Claim'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <div className="small">Page {page} of {totalPages} · {total} requests</div>
        <div style={{marginLeft: 'auto', display:'flex', gap:8}}>
          <button className="button" onClick={() => setPage(1)} disabled={page===1}>First</button>
          <button className="button" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>Prev</button>
          <button className="button" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next</button>
          <button className="button" onClick={() => setPage(totalPages)} disabled={page===totalPages}>Last</button>
        </div>
      </div>
    </div>
  );
}
