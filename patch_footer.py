import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\App.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the footer logic
old_footer_block = """            <footer className="site-footer">
              {t('common.footerText')}
            </footer>
          </div>
        </div>
      </div>"""

new_footer_block = """          </div>
        </div>
        <footer className="site-footer" style={{width: '100%', zIndex: 1000}}>
          ParaliPay - Empowering Farmers, Greening the Future &copy; 2026
        </footer>
      </div>"""

content = content.replace(old_footer_block, new_footer_block)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated footer in App.jsx")
