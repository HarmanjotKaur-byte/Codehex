import { Info } from 'lucide-react';

const MODELS = [
  {
    name: 'Model 1 — Stubble Quantity',
    type: 'ML Regression',
    algorithm: 'Random Forest',
    data: 'MoA&FW crop production 2001–2011',
    metrics: [
      { label: 'R²',   value: '0.9772', good: true  },
      { label: 'MAE',  value: '23,706 t',  good: false },
      { label: 'RMSE', value: '39,047 t',  good: false },
    ],
    note: 'District-level model, per-parcel output scaled proportionally.',
  },
  {
    name: 'Model 3 — Burning Risk',
    type: 'ML Classification',
    algorithm: 'Random Forest (balanced)',
    data: 'NASA FIRMS VIIRS 2023 fire events',
    metrics: [
      { label: 'ROC-AUC',   value: '0.8612', good: true  },
      { label: 'F1',        value: '0.7449', good: true  },
      { label: 'Accuracy',  value: '0.7874', good: true  },
      { label: 'Precision', value: '0.7202', good: true  },
      { label: 'Recall',    value: '0.7714', good: true  },
    ],
    note: 'Evaluated on spatial holdout (unseen grid cells) — no data leakage.',
  },
];

function HowCard({ icon, bg, title, desc, tag, tagClass }) {
  return (
    <div className="how-card">
      <div className="how-icon" style={{ background: bg }}>{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className={tagClass}>{tag}</span>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">🇮🇳 Hackathon 2026</div>
        <h1>ParaliPay</h1>
        <p className="hero-sub">
          Reducing paddy stubble burning across Punjab &amp; Haryana by connecting
          farmers with biomass buyers — powered by real satellite data and machine learning.
        </p>
      </div>

      {/* How It Works */}
      <p className="section-title">How ParaliPay Works</p>
      <div className="how-grid">
        <HowCard
          icon="🌾"
          bg="#dcfce7"
          title="1 · Estimate Stubble"
          desc="Enter your field details — area, location, season. Our regression model predicts how many tonnes of paddy stubble your field will produce."
          tag="ML Regression"
          tagClass="ml-tag"
        />
        <HowCard
          icon="🔥"
          bg="#fee2e2"
          title="2 · Assess Burning Risk"
          desc="Using real NASA FIRMS satellite fire data, our classifier predicts the probability that burning will occur in your grid cell on the given date."
          tag="ML Classification"
          tagClass="ml-tag"
        />
        <HowCard
          icon="🤝"
          bg="#fef3c7"
          title="3 · Find Buyers"
          desc="A transparent multi-criteria scoring algorithm ranks nearby biomass buyers by distance, price, capacity, and availability — no black box ML."
          tag="Rule-Based Scoring"
          tagClass="rule-tag"
        />
      </div>

      {/* Model Transparency */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Info size={18} color="var(--green-700)" />
          <span className="card-title">Model Transparency</span>
        </div>

        {MODELS.map((m) => (
          <div key={m.name} style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--gray-800)' }}>{m.name}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 10 }}>
              {m.algorithm} · {m.data}
            </div>
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {m.metrics.map((mt) => (
                  <tr key={mt.label}>
                    <td>{mt.label}</td>
                    <td className={mt.good ? 'metric-good' : ''}>{mt.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="metric-note" style={{ marginTop: 6 }}>ℹ️ {m.note}</p>
          </div>
        ))}

        <hr className="divider" />
        <div className="info-banner" style={{ marginBottom: 0 }}>
          <Info size={16} />
          <span>
            <strong>Model 2 (Buyer Matching)</strong> is not machine learning.
            It uses a weighted scoring formula: Distance 35% · Price 35% · Capacity 20% · Availability 10%.
            All weights are visible and auditable.
          </span>
        </div>
      </div>
    </div>
  );
}
