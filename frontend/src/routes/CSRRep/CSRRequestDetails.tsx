import React, { useEffect } from 'react';

interface CSRRequestDetailsModalProps {
  request: any;
  onClose: () => void;
  csrId: string | null;
  shortlistedIds: number[];
  interestedIds: number[];
  reloadShortlist: () => Promise<void>;
  reloadInterested: () => Promise<void>;
}

function CSRRequestDetails({ request, onClose, csrId, shortlistedIds, interestedIds, reloadShortlist, reloadInterested }: CSRRequestDetailsModalProps) {
  const lastIncrementedId = React.useRef<number | null>(null);
  useEffect(() => {
    if (request && request.requestId !== lastIncrementedId.current) {
      fetch(`http://localhost:3000/api/pin/requests/${request.requestId}/increment-view`, {
        method: 'POST',
        headers: {
          'x-user-role': 'CSR Rep',
        },
      }).catch(() => {}); // Silently ignore errors
      lastIncrementedId.current = request.requestId;
    }
    // Only call once per unique requestId
    // eslint-disable-next-line
  }, [request?.requestId]);
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            fontSize: 26,
            fontWeight: 700,
            color: '#64748b',
            cursor: 'pointer',
            lineHeight: 1,
            zIndex: 2,
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h3>Request Details</h3>
        <div><b>PIN Name:</b> {request.pinName || 'N/A'}</div>
        <div><b>Title:</b> {request.title || 'Untitled Request'}</div>
        <div><b>Request Type:</b> {request.categoryName}</div>
        <div><b>Location:</b> {request.location || request.locationName || '-'}</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '8px 0' }}>
          <div>
            <b>Status:</b> <span style={{
              color:
                request.status === 'Pending' ? '#f59e42' :
                request.status === 'Available' ? '#22c55e' :
                '#6b7280',
              fontWeight: 700,
              fontSize: '1.05rem',
            }}>{request.status || '-'}</span>
          </div>
          <div>
            {request.urgencyLevel && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 90,
                  padding: '0.4em 1.2em',
                  borderRadius: 18,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  backgroundColor:
                    request.urgencyLevel.toLowerCase() === 'high priority' ? '#ef4444' :
                    request.urgencyLevel.toLowerCase() === 'low priority' ? '#22c55e' : '#6b7280',
                  textAlign: 'center',
                  letterSpacing: 1,
                }}
              >
                {request.urgencyLevel}
              </span>
            )}
          </div>
        </div>
        <div><b>Description:</b></div>
        <div className="desc-box">{request.message || '(No description)'}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
          <button
            className={interestedIds.includes(request.requestId) ? "csr-btn-danger" : "csr-btn"}
            style={{
              minWidth: 110,
              background: request.status === 'Pending' ? '#e5e7eb' : '#2563eb',
              color: request.status === 'Pending' ? '#a1a1aa' : '#fff',
              border: request.status === 'Pending' ? '1px solid #cbd5e1' : 'none',
              opacity: request.status === 'Pending' ? 0.55 : 1,
              cursor: request.status === 'Pending' ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
            disabled={request.status === 'Pending'}
            onClick={async () => {
              if (request.status === 'Pending') return;
              if (!csrId) {
                alert("You must be logged in as a CSR rep to mark interest.");
                return;
              }
              let resp;
              try {
                if (interestedIds.includes(request.requestId)) {
                  resp = await fetch(`http://localhost:3000/api/csr/${csrId}/interested/${request.requestId}`, { method: "DELETE" });
                } else {
                  resp = await fetch(`http://localhost:3000/api/csr/${csrId}/interested/${request.requestId}`, { method: "POST" });
                }
                if (!resp.ok) {
                  const err = await resp.text();
                  alert(`Failed to update interested: ${err}`);
                  return;
                }
                await reloadInterested();
              } catch (e) {
                alert(`Error updating interested: ${e}`);
              }
            }}
          >
            {interestedIds.includes(request.requestId) ? "Unmark Interested" : "Interested"}
          </button>
          <button
            className="csr-heart-btn"
            style={{
              minWidth: 48,
              fontSize: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 0.5em',
              background: 'none',
              border: 'none',
              cursor: csrId ? 'pointer' : 'not-allowed',
              opacity: csrId ? 1 : 0.5,
              transition: 'transform 0.1s',
            }}
            disabled={!csrId}
            onClick={async () => {
              if (!csrId) {
                alert("You must be logged in as a CSR rep to shortlist requests.");
                return;
              }
              let resp;
              try {
                if (shortlistedIds.includes(request.requestId)) {
                  resp = await fetch(`http://localhost:3000/api/csr/${csrId}/shortlist/${request.requestId}`, { method: "DELETE" });
                } else {
                  resp = await fetch(`http://localhost:3000/api/csr/${csrId}/shortlist/${request.requestId}`, { method: "POST" });
                  if (resp.ok) {
                    // Increment shortlist count in pin_requests
                    await fetch(`http://localhost:3000/api/pin/requests/${request.requestId}/increment-shortlist`, { method: 'POST' });
                  }
                }
                if (!resp.ok) {
                  const err = await resp.text();
                  alert(`Failed to update shortlist: ${err}`);
                  return;
                }
                await reloadShortlist();
              } catch (e) {
                alert(`Error updating shortlist: ${e}`);
              }
            }}
            aria-label={shortlistedIds.includes(request.requestId) ? "Remove from shortlist" : "Add to shortlist"}
            title={shortlistedIds.includes(request.requestId) ? "Remove from shortlist" : "Add to shortlist"}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{
              color: shortlistedIds.includes(request.requestId) ? '#ef4444' : '#64748b',
              fontSize: 28,
              lineHeight: 1,
              transition: 'color 0.15s',
              userSelect: 'none',
            }}>
              {shortlistedIds.includes(request.requestId) ? '❤️' : '🤍'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CSRRequestDetails;