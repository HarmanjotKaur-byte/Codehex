import re

filepath = r"frontend\src\pages\BuyerMatching.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace state vars
old_vars = """export default function BuyerMatching({ stubbleResult, farmerLat, farmerLon }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [qty,      setQty]     = useState('');
  const [lat,      setLat]     = useState('');
  const [lon,      setLon]     = useState('');
  const [maxDist,  setMaxDist] = useState('150');"""

new_vars = """const DISTRICT_COORDS = {
  'Ludhiana': { lat: 30.9000, lon: 75.8573 },
  'Amritsar': { lat: 31.6340, lon: 74.8723 },
  'Patiala': { lat: 30.3398, lon: 76.3869 },
  'Bathinda': { lat: 30.2110, lon: 74.9455 },
  'Jalandhar': { lat: 31.3260, lon: 75.5762 },
  'Sangrur': { lat: 30.2458, lon: 75.8421 },
  'Karnal': { lat: 29.6857, lon: 76.9905 },
  'Ambala': { lat: 30.3782, lon: 76.7767 },
  'Kurukshetra': { lat: 29.9695, lon: 76.8783 },
  'Panipat': { lat: 29.3909, lon: 76.9708 },
};

export default function BuyerMatching({ stubbleResult, farmerLat, farmerLon }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [stateName, setStateName] = useState(stubbleResult?.state || 'Punjab');
  const [district, setDistrict] = useState(stubbleResult?.district || 'Ludhiana');
  const [cropYear, setCropYear] = useState(stubbleResult?.cropYear || new Date().getFullYear());
  const [season, setSeason] = useState(stubbleResult?.season || 'Kharif');

  const [qty,      setQty]     = useState('');
  const [maxDist,  setMaxDist] = useState('150');"""

content = content.replace(old_vars, new_vars)

# 2. Replace submit logic
old_submit = """    const latF = parseFloat(lat);
    const lonF = parseFloat(lon);
    const distF = parseFloat(maxDist);
    if (isNaN(latF) || isNaN(lonF) || isNaN(distF)) {
      setError(t('errors.invalidCoords'));
      return;
    }"""

new_submit = """    const coords = DISTRICT_COORDS[district] || { lat: 30.9000, lon: 75.8573 };
    const latF = coords.lat;
    const lonF = coords.lon;
    const distF = parseFloat(maxDist) || 120;"""

content = content.replace(old_submit, new_submit)

# 3. Replace inputs
old_inputs = """            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {t('farmer.latitude')}
                </label>
                <input
                  type="number"
                  className="form-input"
                  step="0.0001"
                  placeholder="e.g. 30.9000"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {t('farmer.longitude')}
                </label>
                <input
                  type="number"
                  className="form-input"
                  step="0.0001"
                  placeholder="e.g. 75.8573"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  required
                />
              </div>
            </div>"""

new_inputs = """            <div className="form-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">{t('common.state') || 'State'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  disabled={!!stubbleResult}
                />
              </div>

              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">{t('common.district') || 'District'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!!stubbleResult}
                />
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">{t('farmer.cropYear') || 'Crop Year'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={cropYear}
                  onChange={(e) => setCropYear(e.target.value)}
                  disabled={!!stubbleResult}
                />
              </div>

              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">{t('farmer.season') || 'Season'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  disabled={!!stubbleResult}
                />
              </div>
            </div>"""

content = content.replace(old_inputs, new_inputs)

# 4. Remove scoring explanation
scoring_pattern = r"""          {\/\* Scoring explanation \*\/}.*?<\/p>"""
content = re.sub(scoring_pattern, "", content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
