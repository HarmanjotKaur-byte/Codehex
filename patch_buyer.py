import re
import os

# 1. Update NavBar.jsx
navbar_path = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\components\NavBar.jsx"
with open(navbar_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add icons
content = content.replace(
    "import { \n  LayoutDashboard, Wheat, Flame, Users, ShoppingBag, PackagePlus, \n  Sliders, ShieldAlert, Layers, UserCheck, ShieldCheck, Bell, X\n} from 'lucide-react';",
    "import { \n  LayoutDashboard, Wheat, Flame, Users, ShoppingBag, PackagePlus, \n  Sliders, ShieldAlert, Layers, UserCheck, ShieldCheck, Bell, X, Search, MapPin, Handshake, Bookmark, UserPlus\n} from 'lucide-react';"
)

old_buyer_tabs = """  const BUYER_TABS = [
    { id: 'dashboard',    label: t('nav.buyerDashboard') || 'Dashboard', Icon: LayoutDashboard },
    { id: 'stubble',      label: t('nav.browseListings') || 'Browse Listings', Icon: ShoppingBag },
    { id: 'preferences',  label: t('nav.buyerPreferences') || 'Buyer Preferences', Icon: Sliders },
    { id: 'activity',     label: t('nav.activityFeed') || 'Activity Feed', Icon: Bell },
  ];"""

new_buyer_tabs = """  const BUYER_TABS = [
    { id: 'dashboard',    label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'find_residue', label: 'Find Residue', Icon: Search },
    { id: 'nearby',       label: 'Nearby Listings', Icon: MapPin },
    { id: 'browse_all',   label: 'Browse All Listings', Icon: ShoppingBag },
    { id: 'my_deals',     label: 'My Deals', Icon: Handshake },
    { id: 'saved',        label: 'Saved Listings', Icon: Bookmark },
    { id: 'register_interest', label: 'Register Interest', Icon: UserPlus },
  ];"""

content = content.replace(old_buyer_tabs, new_buyer_tabs)
with open(navbar_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update BuyerDashboard.jsx
dashboard_path = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\buyer\BuyerDashboard.jsx"
with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write("""import React from 'react';

export default function BuyerDashboard() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
      <p style={{ color: 'var(--gray-500)' }}>Dashboard content will be designed later.</p>
    </div>
  );
}
""")

# 3. Create placeholders
pages_dir = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\buyer"
placeholders = {
    "FindResidue.jsx": "Find Residue (Search & Filter)",
    "NearbyListings.jsx": "Nearby Listings",
    "BrowseAllListings.jsx": "Browse All Listings",
    "MyDeals.jsx": "My Deals",
    "SavedListings.jsx": "Saved Listings",
    "RegisterInterest.jsx": "Register Interest (Specify Buyer Needs for Farmers)"
}

for filename, title in placeholders.items():
    with open(os.path.join(pages_dir, filename), 'w', encoding='utf-8') as f:
        f.write(f"""import React from 'react';

export default function {filename.split('.')[0]}() {{
  return (
    <div style={{{{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}}}>
      <h1>{title}</h1>
      <p style={{{{ color: 'var(--gray-500)' }}}}>This section is currently under development.</p>
    </div>
  );
}}
""")

# 4. Update App.jsx to route to these tabs
app_path = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\App.jsx"
with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Add imports for new pages
new_imports = """
import FindResidue from './pages/buyer/FindResidue.jsx';
import NearbyListings from './pages/buyer/NearbyListings.jsx';
import BrowseAllListings from './pages/buyer/BrowseAllListings.jsx';
import MyDeals from './pages/buyer/MyDeals.jsx';
import SavedListings from './pages/buyer/SavedListings.jsx';
import RegisterInterest from './pages/buyer/RegisterInterest.jsx';
"""
app_content = app_content.replace("// Buyer pages", "// Buyer pages\n" + new_imports)

# Replace buyer switch logic
old_buyer_switch = """      switch (tab) {
        case 'dashboard':
          return <BuyerDashboard />;
        case 'stubble':
          return <AvailableStubble />;
        case 'preferences':
          return <BuyerPreferences />;
        case 'activity':
          return <BuyerActivity />;
        default:
          return <BuyerDashboard />;
      }"""

new_buyer_switch = """      switch (tab) {
        case 'dashboard':
          return <BuyerDashboard />;
        case 'find_residue':
          return <FindResidue />;
        case 'nearby':
          return <NearbyListings />;
        case 'browse_all':
          return <BrowseAllListings />;
        case 'my_deals':
          return <MyDeals />;
        case 'saved':
          return <SavedListings />;
        case 'register_interest':
          return <RegisterInterest />;
        default:
          return <BuyerDashboard />;
      }"""
app_content = app_content.replace(old_buyer_switch, new_buyer_switch)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Updated buyer workflow")
