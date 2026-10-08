import re

filepath = r"frontend\src\pages\BuyerMatching.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the lat/lon form inputs
old_inputs = """            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">{t('farmer.yourLatitude')}</label>
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
                <label className="form-label">{t('farmer.yourLongitude')}</label>
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

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
