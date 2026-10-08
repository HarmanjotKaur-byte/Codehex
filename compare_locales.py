import re

def get_keys(content):
    res = {}
    current_sec = None
    for line in content.split('\n'):
        m_sec = re.match(r'^\s*(\w+):\s*\{', line)
        if m_sec:
            current_sec = m_sec.group(1)
            res[current_sec] = {}
            continue
        if current_sec:
            m_key = re.match(r'^\s*(\w+):\s*"([^"]*)"', line)
            if m_key:
                res[current_sec][m_key.group(1)] = m_key.group(2)
    return res

with open('frontend/src/i18n/locales/en.js', 'r', encoding='utf-8') as f:
    en_keys = get_keys(f.read())
with open('frontend/src/i18n/locales/hi.js', 'r', encoding='utf-8') as f:
    hi_keys = get_keys(f.read())
with open('frontend/src/i18n/locales/pa.js', 'r', encoding='utf-8') as f:
    pa_keys = get_keys(f.read())

print("Section counts:")
for sec in sorted(list(set(list(en_keys.keys()) + list(hi_keys.keys()) + list(pa_keys.keys())))):
    en_cnt = len(en_keys.get(sec, {}))
    hi_cnt = len(hi_keys.get(sec, {}))
    pa_cnt = len(pa_keys.get(sec, {}))
    print(f"  {sec:15}: en={en_cnt:2d}, hi={hi_cnt:2d}, pa={pa_cnt:2d}")
