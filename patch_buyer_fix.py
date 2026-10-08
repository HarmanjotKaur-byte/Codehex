import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\App.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Using regex to replace the switch block for buyer
pattern = r"(if\s*\(currentUser\.role\s*===\s*'BUYER'\)\s*\{\s*switch\s*\(tab\)\s*\{)(.*?)(^\s*\}\s*\})"
replacement = r"""\1
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
\3"""

app_content = re.sub(pattern, replacement, app_content, flags=re.DOTALL | re.MULTILINE)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Updated buyer switch block")
