import { MapPin, DollarSign, Package } from 'lucide-react';

function scoreColor(score) {
  if (score >= 0.70) return 'var(--green-700)';
  if (score >= 0.45) return 'var(--amber-500)';
  return 'var(--gray-500)';
}

export default function BuyerCard({ buyer, rank }) {
  // FIX BUG 3: backend returns suitability_score, not overall_score
  const score = buyer.suitability_score ?? 0;
  const scoreVal = (score * 100).toFixed(0);

  // FIX BUG 3: score breakdown fields are directly on the buyer object, not nested
  const hasBreakdown = (
    buyer.distance_score  !== undefined ||
    buyer.price_score     !== undefined ||
    buyer.capacity_score  !== undefined ||
    buyer.availability_score !== undefined
  );

  return (
    <div className={`buyer-card${rank === 1 ? ' rank-1' : ''}`}>
      <div className="buyer-rank">#{rank}</div>

      <div className="buyer-info">
        <div className="buyer-name">{buyer.buyer_name}</div>
        <div className="buyer-meta">
          <span><MapPin size={13} /> {buyer.distance_km?.toFixed(1)} km away</span>
          {/* FIX BUG 3: backend returns offered_price, not offered_price_per_tonne */}
          <span><DollarSign size={13} /> ₹{buyer.offered_price?.toLocaleString()}/t</span>
          <span><Package size={13} /> Capacity: {buyer.capacity_tonnes?.toLocaleString()} t</span>
          {buyer.district && <span>📍 {buyer.district}{buyer.state ? `, ${buyer.state}` : ''}</span>}
        </div>

        {hasBreakdown && (
          <div className="score-breakdown">
            {buyer.distance_score     !== undefined && <span>Distance: {(buyer.distance_score     * 100).toFixed(0)}</span>}
            {buyer.price_score        !== undefined && <span>Price: {(buyer.price_score           * 100).toFixed(0)}</span>}
            {buyer.capacity_score     !== undefined && <span>Capacity: {(buyer.capacity_score     * 100).toFixed(0)}</span>}
            {buyer.availability_score !== undefined && <span>Avail: {(buyer.availability_score    * 100).toFixed(0)}</span>}
          </div>
        )}
      </div>

      <div className="buyer-score-wrap">
        <div className="buyer-score-value" style={{ color: scoreColor(score) }}>
          {scoreVal}
        </div>
        <div className="buyer-score-label">Score / 100</div>
      </div>
    </div>
  );
}
