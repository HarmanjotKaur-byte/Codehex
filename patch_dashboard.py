import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\Dashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add PackagePlus icon
content = content.replace(
    "import { Calculator, Flame, Users, Activity, ArrowRight, ShieldCheck } from 'lucide-react';",
    "import { Calculator, Flame, Users, Activity, ArrowRight, ShieldCheck, PackagePlus } from 'lucide-react';"
)

# 2. Add Card 5
card_5 = """
        {/* Card 5 */}
        <div style={cardStyle} onClick={() => setTab('create_listing')}>
          <div style={{...iconWrapperStyle, backgroundColor: '#f3e8ff', color: '#6b21a8'}}>
            <PackagePlus size={24} />
          </div>
          <h3 style={cardTitleStyle}>Create New Listing</h3>
          <p style={cardDescStyle}>
            List your available stubble on the marketplace so buyers can discover and purchase directly from you.
          </p>
          <button style={actionBtnStyle}>
            Create Listing <ArrowRight size={16} />
          </button>
        </div>
"""

content = content.replace("      </div>\n\n      {/* Info Banner */}", card_5 + "      </div>\n\n      {/* Info Banner */}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Create New Listing card to Dashboard")
