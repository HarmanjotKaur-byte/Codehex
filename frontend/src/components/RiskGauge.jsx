/**
 * RiskGauge — displays fire-risk probability with colour-coded tier.
 * tier is derived server-side: LOW / MEDIUM / HIGH
 */

function tierFromProb(prob) {
  if (prob < 0.33) return 'low';
  if (prob < 0.66) return 'medium';
  return 'high';
}

export default function RiskGauge({ probability, risk_level }) {
  const pct = Math.round(probability * 100);
  const tier = (risk_level || tierFromProb(probability)).toLowerCase();

  return (
    <div className={`risk-result ${tier}`}>
      <div className="risk-prob">{pct}%</div>
      <div style={{ marginTop: 6, fontSize: '0.85rem', opacity: 0.8 }}>
        Probability of stubble burning
      </div>
      <div className="progress-bar-wrap" style={{ maxWidth: 280, margin: '14px auto 6px' }}>
        <div
          className={`progress-bar-fill ${tier}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`risk-badge ${tier}`}>{tier} risk</span>
    </div>
  );
}
