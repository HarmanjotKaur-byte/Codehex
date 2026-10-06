import { Cpu, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ModelInformation() {
  return (
    <div>
      <div className="page-header">
        <h2>🔬 ML Model Transparency & Scientific Audit</h2>
        <p>Comprehensive technical specifications, validated benchmark metrics, and operational boundaries.</p>
      </div>

      {/* Model 1 */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="card-title">MODEL 1: Stubble Quantity Estimation</div>
            <div className="card-subtitle">Predicts harvestable paddy stubble (tonnes) from parcel area and historical baseline</div>
          </div>
          <span className="chip chip-green">ML Regression</span>
        </div>

        <table className="metrics-table" style={{ marginBottom: 16 }}>
          <tbody>
            <tr><td style={{ width: '220px' }}>Algorithm Architecture</td><td><strong>Random Forest Regressor</strong> (Scikit-Learn Pipeline)</td></tr>
            <tr><td>Target Variable</td><td><code>stubble_quantity_tonnes</code> (Derived using ICAR RPR = 1.40, recovery = 80%)</td></tr>
            <tr><td>Primary Training Dataset</td><td>Ministry of Agriculture & Farmers Welfare (MoA&FW) APY (2001–2011)</td></tr>
            <tr><td>Test Benchmark R²</td><td><strong style={{ color: 'var(--green-700)', fontSize: '1.05rem' }}>R² = 0.9772</strong></td></tr>
            <tr><td>Test MAE</td><td>23,705.91 metric tonnes</td></tr>
            <tr><td>Test RMSE</td><td>39,046.67 metric tonnes</td></tr>
          </tbody>
        </table>

        <div className="info-banner" style={{ marginBottom: 0 }}>
          <AlertCircle size={18} />
          <span>
            <strong>Scientific Boundary:</strong> This metric represents performance on the historical regional dataset used for training/testing and should not be interpreted as field-level measurement accuracy.
          </span>
        </div>
      </div>

      {/* Model 2 */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="card-title">MODEL 2: Smart Buyer Matching Engine</div>
            <div className="card-subtitle">Ranks commercial biomass aggregators against farmer parcel requirements</div>
          </div>
          <span className="chip chip-amber">Deterministic Rule-Based (Non-ML)</span>
        </div>

        <table className="metrics-table" style={{ marginBottom: 16 }}>
          <tbody>
            <tr><td style={{ width: '220px' }}>Architecture Type</td><td><strong>Rule-Based Multi-Criteria Weighted Scoring</strong></td></tr>
            <tr><td>Machine Learning Role</td><td><strong>None (Strictly Non-ML)</strong></td></tr>
            <tr><td>Distance Factor (Haversine)</td><td><strong>35% Weight</strong> — Linear decay up to maximum search radius</td></tr>
            <tr><td>Offered Procurement Price</td><td><strong>35% Weight</strong> — Evaluated relative to ₹2,500/t regional benchmark</td></tr>
            <tr><td>Daily Processing Capacity</td><td><strong>20% Weight</strong> — Assesses volume absorption capacity</td></tr>
            <tr><td>Operational Availability</td><td><strong>10% Weight</strong> — Active intake operational status</td></tr>
          </tbody>
        </table>

        <div className="info-banner" style={{ marginBottom: 0 }}>
          <ShieldCheck size={18} />
          <span>
            <strong>Architectural Audit:</strong> This component is rule-based, not ML. No synthetic training data or pseudo-learning algorithms were introduced.
          </span>
        </div>
      </div>

      {/* Model 3 */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="card-title">MODEL 3: Stubble Burning Risk Classifier</div>
            <div className="card-subtitle">Predicts probability of observing fire events in a spatiotemporal grid cell</div>
          </div>
          <span className="chip chip-green">ML Classification</span>
        </div>

        <table className="metrics-table" style={{ marginBottom: 16 }}>
          <tbody>
            <tr><td style={{ width: '220px' }}>Algorithm Architecture</td><td><strong>Random Forest Classifier</strong> (Balanced class weighting)</td></tr>
            <tr><td>Target Variable</td><td><code>fire_event_occurred</code> ∈ &#123;0, 1&#125; (NASA FIRMS VIIRS satellite observations)</td></tr>
            <tr><td>Spatiotemporal Resolution</td><td>0.25° × 0.25° grid lattice (~27 km) covering Punjab & Haryana</td></tr>
            <tr><td>Validation Strategy</td><td>Spatial Holdout Split (Unseen geographic grid cells — zero spatial leakage)</td></tr>
            <tr><td>Test ROC-AUC</td><td><strong style={{ color: 'var(--green-700)', fontSize: '1.05rem' }}>ROC-AUC = 0.8612</strong></td></tr>
            <tr><td>Test Accuracy</td><td><strong>78.74%</strong></td></tr>
            <tr><td>Test Recall (Fires)</td><td><strong>77.14%</strong></td></tr>
            <tr><td>Test Precision</td><td><strong>72.02%</strong></td></tr>
            <tr><td>Test F1 Score</td><td><strong>74.49%</strong></td></tr>
          </tbody>
        </table>

        <div className="info-banner" style={{ marginBottom: 0 }}>
          <AlertCircle size={18} />
          <span>
            <strong>Operational Definition:</strong> The model predicts the probability of observing burning activity in a geographic grid cell on a given date. It is an area-level surveillance model, not an individual farmer behavior tracker.
          </span>
        </div>
      </div>
    </div>
  );
}
