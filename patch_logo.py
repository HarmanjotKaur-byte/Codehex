import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\components\Header.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the <div className="header-user-info" ...> ... </div> block.
# Finding it is easy, from `<div className="header-user-info" style={{ position: 'relative' }}>` to `</div>\n          )}`

start_str = '<div className="header-user-info" style={{ position: \'relative\' }}>'
end_str = '          )}\n        </div>'
start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_ui = """<div className="header-user-info" style={{ position: 'relative' }}>
              <div 
                className="profile-trigger" 
                onClick={() => { setShowProfileModal(true); setProfileOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--green-100)', color: 'var(--green-700)', padding: '10px', borderRadius: '50%', border: '2px solid var(--green-600)' }}
              >
                <User size={20} />
              </div>
            </div>
"""
    content = content[:start_idx] + new_ui + content[end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Simplified profile logo in Header.jsx")
