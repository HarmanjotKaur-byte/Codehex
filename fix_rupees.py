with open('frontend/src/i18n/locales/en.js', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('",1"', '"₹"')
with open('frontend/src/i18n/locales/en.js', 'w', encoding='utf-8') as f:
    f.write(c)
