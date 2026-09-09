export default function AuthFlowDiagram() {
  const steps = [
    { num: 1, title: 'User Input', desc: 'User enters credentials in React form' },
    { num: 2, title: 'POST /api/login', desc: 'Client sends email & password in JSON body' },
    { num: 3, title: 'Credential Check', desc: 'Express validates credentials against user store' },
    { num: 4, title: 'JWT Generation', desc: 'Server signs token using process.env.JWT_SECRET' },
    { num: 5, title: 'Token Response', desc: 'Client receives signed token & user metadata' },
    { num: 6, title: 'Client Storage', desc: 'Token stored in sessionStorage (tab-scoped)' },
    { num: 7, title: 'Protected Request', desc: 'Headers sent with Authorization: Bearer <token>' },
    { num: 8, title: 'Server Verification', desc: 'authenticateToken middleware checks signature' },
    { num: 9, title: 'Data Delivered', desc: 'Server returns protected resource if valid' },
  ];

  return (
    <div className="card auth-flow-card">
      <div className="card-header">
        <h3>🔄 Stateless JWT Authentication Lifecycle</h3>
        <span className="badge-pill">Stateless Architecture</span>
      </div>

      <div className="flow-steps-grid">
        {steps.map((s, idx) => (
          <div key={s.num} className="flow-step-item">
            <div className="step-badge">{s.num}</div>
            <div className="step-content">
              <strong>{s.title}</strong>
              <p>{s.desc}</p>
            </div>
            {idx < steps.length - 1 && <span className="step-arrow">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
