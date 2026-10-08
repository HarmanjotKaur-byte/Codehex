import re
import os

paths = ['frontend/src/i18n/locales/en.js', 'frontend/src/i18n/locales/hi.js', 'frontend/src/i18n/locales/pa.js']

location_en = """
  location: {
    stateLabel: "State *",
    districtLabel: "District *",
    villageLabel: "Village *",
    selectState: "Select your State ▼",
    selectDistrict: "Select your District ▼",
    selectVillage: "Search and select your Village ▼",
    search: "Search..."
  },
"""
location_hi = """
  location: {
    stateLabel: "राज्य *",
    districtLabel: "ज़िला *",
    villageLabel: "गाँव *",
    selectState: "अपना राज्य चुनें ▼",
    selectDistrict: "अपना ज़िला चुनें ▼",
    selectVillage: "अपना गाँव खोजें और चुनें ▼",
    search: "खोजें..."
  },
"""
location_pa = """
  location: {
    stateLabel: "ਰਾਜ *",
    districtLabel: "ਜ਼ਿਲ੍ਹਾ *",
    villageLabel: "ਪਿੰਡ *",
    selectState: "ਆਪਣਾ ਰਾਜ ਚੁਣੋ ▼",
    selectDistrict: "ਆਪਣਾ ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ ▼",
    selectVillage: "ਆਪਣਾ ਪਿੰਡ ਲੱਭੋ ਅਤੇ ਚੁਣੋ ▼",
    search: "ਖੋਜੋ..."
  },
"""

for path in paths:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'location:' not in content:
            insert_text = location_en if 'en.js' in path else location_hi if 'hi.js' in path else location_pa
            content = content.replace('export default {', 'export default {' + insert_text)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

print("Translations added successfully.")
