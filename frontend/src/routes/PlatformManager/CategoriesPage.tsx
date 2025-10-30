import { useEffect, useState } from "react";
import "./CategoriesPage.css";

type Item = { id: number; name: string };

export default function CategoriesPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const url = q.trim() ? `/api/service-types/search?q=${encodeURIComponent(q.trim())}` : `/api/service-types/search`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      setError(e.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async () => {
    const nm = name.trim();
    if (!nm) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/service-types`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm }) });
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
      const res = await fetch(`/api/service-types/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message || 'Update failed');
    } finally { setBusy(false); }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/service-types/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="pm-categories">
      <h2>Service Categories</h2>
      <div className="row">
        <input placeholder="Search categories" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load}>Search</button>
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

