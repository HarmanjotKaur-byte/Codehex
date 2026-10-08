with open('frontend/src/i18n/locales/en.js', 'r', encoding='utf-8') as f:
    c = f.read()

overrides = {
    '"Sign In Btn"': '"Sign In"',
    '"Farmer Pill"': '"Farmer / Seller"',
    '"Buyer Pill"': '"Biomass Buyer"',
    '"Gov Pill"': '"Government Official"',
    '"No Account"': '"Don\'t have an account?"',
    '"Have Account"': '"Already have an account?"',
    '"Supe Admin"': '"Super Administrator"',
    '"Gov Dashboard"': '"Overview"',
    '"Gov Burning Risk"': '"Burning Risk"',
    '"Gov Burning Stats"': '"Burning Statistics"',
    '"Gov Stubble Avail"': '"Stubble Availability"',
    '"Gov Marketplace"': '"Marketplace Monitoring"',
    '"Gov Priority"': '"Priority Areas"',
    '"Gov Reports"': '"Reports"',
    '"Gov Profile"': '"My Profile"',
    '"Farmer Dashboard"': '"Dashboard"',
    '"Buyer Dashboard"': '"Dashboard"',
    '"Subtitle"': '"Please sign in to access your dashboard."',
    '"Secure Auth"': '"Secure Authentication"',
    '"Passwords Mismatch"': '"Passwords do not match."',
    '"Password Min Length"': '"Password must be at least 8 characters."',
}

for k, v in overrides.items():
    c = c.replace(k, v)

with open('frontend/src/i18n/locales/en.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("en.js polished.")
