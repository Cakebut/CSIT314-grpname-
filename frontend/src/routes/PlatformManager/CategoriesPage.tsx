import { useEffect, useState } from "react";
import "./CategoriesPage.css";

type Item = { id: number; name: string; deleted?: boolean };

export default function CategoriesPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (showDeleted) params.set('includeDeleted', 'true');
      const url = `/api/pm/service-types/search${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      const rows: Item[] = data.items || [];
      setItems(rows);
    } catch (e: any) {
      setError(e.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh when toggling Show deleted
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted]);

  const onCreate = async () => {
    const nm = name.trim();
    if (!nm) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/pm/service-types`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setName("");
      await load();
    } catch (e: any) {
      setError(e.message || 'Create failed');
    } finally { setBusy(false); }
  };

  const onUpdate = async () => {
    if (!editing) return;
    const nm = editing.name.trim();
    if (!nm) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/pm/service-types/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message || 'Update failed');
    } finally { setBusy(false); }
  };

  // Soft delete a category
  const onDelete = async (id: number) => {
    if (!confirm("Delete this category? It will be hidden but can be restored later.")) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/pm/service-types/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
    } catch (e: any) {
      setError(String(e?.message || 'Delete failed'));
    } finally { setBusy(false); }
  };

  // Restore a soft-deleted category
  const onRestore = async (id: number) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/pm/service-types/${id}/restore`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Restore failed');
      await load();
    } catch (e: any) {
      setError(String(e?.message || 'Restore failed'));
    } finally { setBusy(false); }
  };

  return (
    <div className="pm-categories">
      <h2>Service Categories</h2>
      <div className="row">
        <input placeholder="Search categories" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load}>Search</button>
        <label style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
          <input type="checkbox" checked={showDeleted} onChange={e=>{ setShowDeleted(e.target.checked); }} />
          Show deleted
        </label>
      </div>

      <div className="row">
        <input placeholder="New category name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={onCreate} disabled={busy}>Add</button>
      </div>

      {error && <div className="error">{error}</div>}

      <table className="simple">
        <thead>
          <tr><th>Name</th><th style={{width:200}}>Actions</th></tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>
                {editing?.id === it.id ? (
                  <input value={editing.name} onChange={e=>setEditing({ ...editing, name: e.target.value })} />
                ) : (
                  it.name
                )}
              </td>
              <td>
                {editing?.id === it.id ? (
                  <>
                    <button onClick={onUpdate} disabled={busy}>Save</button>
                    <button onClick={()=>setEditing(null)} disabled={busy}>Cancel</button>
                  </>
                ) : it.deleted ? (
                  <>
                    <button onClick={()=>onRestore(it.id)} disabled={busy}>Restore</button>
                  </>
                ) : (
                  <>
                    <button onClick={()=>setEditing(it)} disabled={busy}>Edit</button>
                    <button onClick={()=>onDelete(it.id)} disabled={busy}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={2}><div className="empty">No categories found</div></td></tr>}
        </tbody>
      </table>
    </div>
  );
}

