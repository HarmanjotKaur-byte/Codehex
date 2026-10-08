import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    app_code = f.read()

# Make App.jsx use a dashboard layout
layout = """
    return (
      <div className="app-layout">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
        <div className="main-container">
          <NavBar role={currentUser.role} active={tab} onChange={setTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="content-area">
            <main className="page-wrapper">{renderPage()}</main>
            <footer className="site-footer">
              ParaliPay — AI Stubble Management Platform | Hackathon 2026 | ML models powered by real MoA&FW and NASA FIRMS VIIRS satellite data
            </footer>
          </div>
        </div>
      </div>
    );
"""

# I need to insert `const [sidebarOpen, setSidebarOpen] = useState(false);`
app_code = app_code.replace(
    "const [tab, setTab] = useState('dashboard');",
    "const [tab, setTab] = useState('dashboard');\n    const [sidebarOpen, setSidebarOpen] = useState(false);"
)

app_code = re.sub(r'return \(\s*<div className="app-root">\s*<Header />\s*<NavBar role=\{currentUser\.role\} active=\{tab\} onChange=\{setTab\} />\s*<main className="page-wrapper">\{renderPage\(\)\}</main>\s*<footer className="site-footer">.*?</footer>\s*</div>\s*\);', layout, app_code, flags=re.DOTALL)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_code)

print("App.jsx updated with Dashboard layout")
