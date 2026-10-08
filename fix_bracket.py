with open('frontend/src/pages/auth/RegisterPage.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('Account"`}', 'Account"}')
c = c.replace('Account"}`}', 'Account"}')

with open('frontend/src/pages/auth/RegisterPage.jsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed again")
