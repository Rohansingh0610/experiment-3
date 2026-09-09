import { useAuth } from '../context/AuthContext.jsx';

export default function JwtInspector() {
  const { token, decodedPayload, decodedHeader } = useAuth();

  if (!token) {
    return (
      <div className="card inspector-card">
        <div className="card-header">
          <h3>🔍 Educational JWT Token Inspector</h3>
        </div>
        <p className="empty-text">
          No JWT active in <code>sessionStorage</code>. Log in to inspect the token structure.
        </p>
      </div>
    );
  }

  const parts = token.split('.');
  const rawHeader = parts[0] || '';
  const rawPayload = parts[1] || '';
  const rawSignature = parts[2] || '';

  // Format timestamps
  const iatDate = decodedPayload?.iat
    ? new Date(decodedPayload.iat * 1000).toLocaleString()
    : 'N/A';
  const expDate = decodedPayload?.exp
    ? new Date(decodedPayload.exp * 1000).toLocaleString()
    : 'N/A';

  return (
    <div className="card inspector-card">
      <div className="card-header">
        <div>
          <h3>🔍 Educational JWT Token Inspector</h3>
          <p className="section-desc">
            Visual breakdown of the active token stored in <code>sessionStorage</code>.
          </p>
        </div>
        <span className="badge-stateless">Stateless Token Active</span>
      </div>

      {/* Critical Security Callout */}
      <div className="security-alert-box">
        <div className="alert-icon">⚠️</div>
        <div>
          <strong>Important Lab Viva Concept: Decoding ≠ Verification</strong>
          <p>
            The JSON claims below are base64-decoded on the client purely for educational inspection.
            Anyone can decode a JWT payload because it is not encrypted. <strong>Never</strong> make
            client-side security decisions based solely on decoded claims. True security occurs exclusively
            when the <strong>Express backend verifies the cryptographic signature</strong> using the secret key!
          </p>
        </div>
      </div>

      {/* Color-Coded Encoded JWT Structure */}
      <div className="jwt-segments-overview">
        <label className="field-label">Compact Encoded Token Representation:</label>
        <div className="compact-token-display">
          <span className="jwt-part-header" title="Part 1: Header">{rawHeader}</span>
          <span className="jwt-part-dot">.</span>
          <span className="jwt-part-payload" title="Part 2: Payload">{rawPayload}</span>
          <span className="jwt-part-dot">.</span>
          <span className="jwt-part-signature" title="Part 3: Signature">{rawSignature}</span>
        </div>
        <div className="segment-legend">
          <span className="legend-item legend-header">■ Header (Algorithm & Token Type)</span>
          <span className="legend-item legend-payload">■ Payload (Data Claims)</span>
          <span className="legend-item legend-signature">■ Signature (Verification Hash)</span>
        </div>
      </div>

      {/* Decoded Three-Column Breakdown */}
      <div className="decoded-columns-grid">
        {/* Column 1: Header */}
        <div className="decoded-box border-header">
          <div className="box-title color-header">1. Decoded Header</div>
          <pre className="code-display">
            {JSON.stringify(decodedHeader, null, 2)}
          </pre>
          <span className="box-footer-note">Algorithm: HS256 • Type: JWT</span>
        </div>

        {/* Column 2: Decoded Claims */}
        <div className="decoded-box border-payload">
          <div className="box-title color-payload">2. Decoded Payload (Claims)</div>
          <pre className="code-display">
            {JSON.stringify(decodedPayload, null, 2)}
          </pre>
          <div className="claims-meta-table">
            <div><span>User ID:</span> <strong>{decodedPayload?.id}</strong></div>
            <div><span>Email:</span> <strong>{decodedPayload?.email}</strong></div>
            <div><span>Role:</span> <strong>{decodedPayload?.role}</strong></div>
            <div><span>Issued At (iat):</span> <small>{iatDate}</small></div>
            <div><span>Expires At (exp):</span> <small>{expDate}</small></div>
          </div>
        </div>

        {/* Column 3: Signature */}
        <div className="decoded-box border-signature">
          <div className="box-title color-signature">3. Cryptographic Signature</div>
          <div className="signature-info-card">
            <p className="sig-formula">
              <code>HMACSHA256(</code><br />
              &nbsp;&nbsp;<code>base64UrlEncode(header) + "." +</code><br />
              &nbsp;&nbsp;<code>base64UrlEncode(payload),</code><br />
              &nbsp;&nbsp;<span className="secret-hint">process.env.JWT_SECRET</span><br />
              <code>)</code>
            </p>
            <p className="sig-explanation">
              The signature ensures token integrity. If an attacker modifies even 1 bit of the payload,
              the backend's recalculated signature will not match, triggering HTTP 401 Unauthorized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
