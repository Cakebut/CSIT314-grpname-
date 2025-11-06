function isAnnouncementResponse(obj: unknown): obj is { error?: string; deliveredCount?: number } {
  return typeof obj === 'object' && obj !== null && (
    'error' in obj || 'deliveredCount' in obj
  );
}
import { useEffect, useState } from "react";
import "./AnnouncementsPage.css";
import { toast } from "react-toastify";

export default function AnnouncementsPage() {
  
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [latest, setLatest] = useState<{ message: string; createdAt: string } | null>(null);

  const loadLatest = async () => {
    try {
      const res = await fetch(`/api/pm/announcements/latest`);
      const data = await res.json();
      setLatest(data?.latest ?? null);
    } catch {
      // ignore preview errors
    }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  const onSend = async () => {
    setInfo(null); setError(null);
    if (!message.trim()) { setError("Message cannot be empty"); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/pm/announcements/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const text = await res.text();
      let data: unknown = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON (e.g., HTML) */ }
      let errorMsg: string | undefined = undefined;
      let deliveredCount: number | undefined = undefined;
      if (isAnnouncementResponse(data)) {
        errorMsg = data.error;
        deliveredCount = data.deliveredCount;
      }
      if (!res.ok) throw new Error(errorMsg || `Failed to send (${res.status})`);
      const successMsg = `Sent to ${deliveredCount ?? '?'} users`;
      setInfo(successMsg);
      toast.success(successMsg);
      setMessage("");
      loadLatest();
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Error occurred";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pm-announce">
      <h2>Platform Manager — Announcements</h2>
      <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Type your message..."/>
      <div className="actions">
        <button onClick={onSend} disabled={busy}>Send to All Users</button>
      </div>
      {error && <div className="error">{error}</div>}
      {info && <div className="info">{info}</div>}
      {latest && (
        <div className="latest" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Latest announcement</div>
          <div style={{ color: '#374151' }}>{latest.message}</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>at {new Date(latest.createdAt).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
