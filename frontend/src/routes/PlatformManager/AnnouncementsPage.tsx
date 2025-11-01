import { useState } from "react";
import "./AnnouncementsPage.css";

export default function AnnouncementsPage() {
  
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON (e.g., HTML) */ }
      if (!res.ok) throw new Error(data?.error || `Failed to send (${res.status})`);
      setInfo(`Sent to ${data.deliveredCount} users`);
      setMessage("");
    } catch (e: any) {
      setError(e.message || "Error occurred");
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
    </div>
  );
}
