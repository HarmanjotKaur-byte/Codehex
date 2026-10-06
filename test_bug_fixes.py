import sys
sys.path.insert(0, '.')
import warnings
warnings.filterwarnings('ignore')

from fastapi.testclient import TestClient
from backend.main import app

with TestClient(app) as client:

    # ── TEST 1: Stubble Area=10 ──────────────────────────────────────────────────
    print("=== TEST 1: Stubble Area=10, Punjab, Ludhiana, 2026, Kharif ===")
    r = client.post('/api/stubble/predict', json={
        'Area': 10, 'State_Name': 'Punjab', 'District_Name': 'Ludhiana',
        'Crop_Year': 2026, 'Season': 'Kharif'
    })
    d = r.json()
    print(f"  predicted_stubble_tonnes      : {d.get('predicted_stubble_tonnes')}")
    print(f"  state_used                    : {d.get('state_used')}")
    print(f"  district_used                 : {d.get('district_used')}")
    print(f"  area_hectares                 : {d.get('area_hectares')}")
    print(f"  district_baseline_yield_t_ha  : {d.get('district_baseline_yield_t_ha')}")
    assert r.status_code == 200, f"TEST 1 FAIL: HTTP {r.status_code}"
    assert d.get('predicted_stubble_tonnes') and d['predicted_stubble_tonnes'] > 0, "TEST 1 FAIL: no prediction"
    assert d.get('state_used') is not None, "TEST 1 FAIL: state_used missing"
    assert d.get('district_used') is not None, "TEST 1 FAIL: district_used missing"
    assert d.get('area_hectares') == 10.0, f"TEST 1 FAIL: area_hectares={d.get('area_hectares')}"
    assert d.get('district_baseline_yield_t_ha') is not None, "TEST 1 FAIL: district_baseline_yield_t_ha missing"
    print("  RESULT: PASS\n")
    t1_tonnes = d['predicted_stubble_tonnes']

    # ── TEST 2: Stubble Area=20 ──────────────────────────────────────────────────
    print("=== TEST 2: Stubble Area=20, Punjab, Ludhiana, 2026, Kharif ===")
    r2 = client.post('/api/stubble/predict', json={
        'Area': 20, 'State_Name': 'Punjab', 'District_Name': 'Ludhiana',
        'Crop_Year': 2026, 'Season': 'Kharif'
    })
    d2 = r2.json()
    print(f"  predicted_stubble_tonnes : {d2.get('predicted_stubble_tonnes')}")
    print(f"  area_hectares            : {d2.get('area_hectares')}")
    ratio = d2['predicted_stubble_tonnes'] / t1_tonnes
    print(f"  ratio vs 10ha            : {ratio:.3f} (expect ~2.0)")
    assert r2.status_code == 200
    assert d2.get('area_hectares') == 20.0, f"TEST 2 FAIL: area_hectares={d2.get('area_hectares')}"
    assert d2['predicted_stubble_tonnes'] > t1_tonnes, "TEST 2 FAIL: 20ha should predict more than 10ha"
    print("  RESULT: PASS\n")

    # ── TEST 3: Burning Risk ─────────────────────────────────────────────────────
    print("=== TEST 3: Burning Risk lat=30.9, lon=75.8573, date=2026-11-01 ===")
    r3 = client.post('/api/risk/predict', json={'latitude': 30.9, 'longitude': 75.8573, 'date': '2026-11-01'})
    d3 = r3.json()
    prob = d3.get('burning_probability')
    print(f"  burning_probability   : {prob}")
    print(f"  risk_level            : {d3.get('risk_level')}")
    print(f"  date_analyzed         : {d3.get('date_analyzed')}")
    print(f"  day_of_harvest_season : {d3.get('day_of_harvest_season')}")
    is_valid_prob = isinstance(prob, (int, float)) and not (prob != prob) and 0.0 <= prob <= 1.0
    print(f"  prob is valid 0-1     : {is_valid_prob}")
    print(f"  display as %          : {round(prob * 100, 2)}%" if is_valid_prob else "  FAIL: NaN would show")
    # NaN check: field was fire_probability (wrong) — must be burning_probability
    assert 'burning_probability' in d3, "TEST 3 FAIL: burning_probability field missing"
    assert 'fire_probability' not in d3, "TEST 3 NOTE: wrong field fire_probability does not exist (expected)"
    assert is_valid_prob, f"TEST 3 FAIL: probability invalid: {prob}"
    assert d3.get('date_analyzed') is not None, "TEST 3 FAIL: date_analyzed missing"
    assert d3.get('day_of_harvest_season') is not None, "TEST 3 FAIL: day_of_harvest_season missing"
    print("  RESULT: PASS\n")

    # ── TEST 4: Buyer Matching dist=300 ─────────────────────────────────────────
    print("=== TEST 4: Buyer Match stubble=30.3t, lat=30.9, lon=75.8573, dist=300km ===")
    r4 = client.post('/api/buyers/match', json={
        'stubble_quantity': 30.3, 'farmer_latitude': 30.9,
        'farmer_longitude': 75.8573, 'max_distance_km': 300
    })
    d4 = r4.json()
    print(f"  matched_buyers_count  : {d4.get('matched_buyers_count')}")
    print(f"  search_radius_km      : {d4.get('search_radius_km')}")
    print(f"  farmer_stubble_tonnes : {d4.get('farmer_stubble_tonnes')}")
    matches = d4.get('matches', [])
    print(f"  matches list length   : {len(matches)}")
    if matches:
        m0 = matches[0]
        print(f"  #1 buyer: {m0['buyer_name']}")
        print(f"     suitability_score  : {m0.get('suitability_score')} (not overall_score)")
        print(f"     offered_price      : Rs.{m0.get('offered_price')}/t (not offered_price_per_tonne)")
        print(f"     distance_km        : {m0.get('distance_km')}km")
    assert r4.status_code == 200
    assert 'matched_buyers_count' in d4, "TEST 4 FAIL: matched_buyers_count missing"
    assert 'search_radius_km' in d4, "TEST 4 FAIL: search_radius_km missing"
    assert d4['search_radius_km'] == 300.0, f"TEST 4 FAIL: search_radius_km={d4.get('search_radius_km')}"
    assert d4['farmer_stubble_tonnes'] == 30.3, f"TEST 4 FAIL: farmer_stubble_tonnes={d4.get('farmer_stubble_tonnes')}"
    assert len(matches) == d4['matched_buyers_count'], "TEST 4 FAIL: count mismatch"
    if matches:
        assert 'suitability_score' in matches[0], "TEST 4 FAIL: suitability_score missing"
        assert 'offered_price' in matches[0], "TEST 4 FAIL: offered_price missing"
        assert 'offered_price_per_tonne' not in matches[0], "TEST 4 INFO: correct - no offered_price_per_tonne"
        assert 'overall_score' not in matches[0], "TEST 4 INFO: correct - no overall_score"
    print("  RESULT: PASS\n")
    count_300 = d4['matched_buyers_count']

    # ── TEST 5: Buyer Matching dist=500 ─────────────────────────────────────────
    print("=== TEST 5: Buyer Match dist=500km ===")
    r5 = client.post('/api/buyers/match', json={
        'stubble_quantity': 30.3, 'farmer_latitude': 30.9,
        'farmer_longitude': 75.8573, 'max_distance_km': 500
    })
    d5 = r5.json()
    print(f"  matched_buyers_count : {d5.get('matched_buyers_count')}")
    print(f"  search_radius_km     : {d5.get('search_radius_km')}")
    assert d5['search_radius_km'] == 500.0, f"TEST 5 FAIL: search_radius_km={d5.get('search_radius_km')}"
    assert d5['matched_buyers_count'] >= count_300, "TEST 5 FAIL: 500km should match >= 300km buyers"
    print("  RESULT: PASS\n")

    # ── Summary ──────────────────────────────────────────────────────────────────
    print("=" * 50)
    print("ALL 5 INTEGRATION TESTS: PASS")
    print(f"  Stubble 10ha  : {t1_tonnes:.2f} t")
    print(f"  Stubble 20ha  : {d2['predicted_stubble_tonnes']:.2f} t")
    print(f"  Burning Risk  : {round(prob*100,2)}% ({d3['risk_level']})")
    print(f"  Buyers 300km  : {count_300} buyers found")
    print(f"  Buyers 500km  : {d5['matched_buyers_count']} buyers found")
