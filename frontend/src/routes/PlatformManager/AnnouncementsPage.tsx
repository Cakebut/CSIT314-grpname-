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
      <div className="pm-announce-header">
        <div className="pm-announce-title">Platform Announcements</div>
        <div className="pm-announce-sub">Send important messages to all active users across the platform</div>
      </div>

      <div className="pm-announce-card">
        <label className="pm-announce-label">Announcement Message</label>
        <div className="pm-announce-input-wrap">
          <textarea className="pm-announce-textarea" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Type your announcement message here..." />
        </div>
        <div className="pm-announce-foot">
          <div className="pm-announce-note">This message will be displayed to all PINs, CSRs, and Admins currently using the platform</div>
          <div className="pm-announce-actions">
            <button className="pm-send-btn" onClick={onSend} disabled={busy} aria-disabled={busy}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: 8 }}>
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Send Announcement
            </button>
          </div>
        </div>
      </div>

      <div className="pm-announce-info">
        <div className="pm-info-icon">📣</div>
        <div>
          <div className="pm-info-title">How Announcements Work</div>
          <div className="pm-info-desc">When you send an announcement, all active users will receive a pop-up notification with your message. This is ideal for system updates, maintenance notices, or important policy changes that require immediate attention.</div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {info && <div className="info">{info}</div>}
      {latest && (
        <div className="latest" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Latest Announcement :</div>
          <div style={{ color: '#374151' }}>{latest.message}</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>at {new Date(latest.createdAt).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
