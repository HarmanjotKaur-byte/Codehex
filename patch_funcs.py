import re

filepath = r"D:\Hackathon\CodeHex-AI-Enabled-Platform-for-Connecting-Farmers-with-Biomass-Buyers-to-Reduce-Paddy-Stubble-Burni\frontend\src\pages\FarmerActivity.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

funcs = """
  const handleEditClick = (listing) => {
    setEditingListing(listing);
    setEditForm({
      quantity_tonnes: listing.quantity_tonnes || '',
      asking_price_per_tonne: listing.asking_price_per_tonne || '',
      crop: listing.crop || '',
      condition: listing.condition || '',
    });
  };

  const handleUpdateListing = async () => {
    try {
      const res = await fetch(`/api/listings/${editingListing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingListing(null);
        loadData();
      } else {
        alert("Failed to update");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating");
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('paralipay_token')}`
        }
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting");
    }
  };
"""

# Insert before statusBadge
content = content.replace("  const statusBadge = (status) => {", funcs + "\n  const statusBadge = (status) => {")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added missing functions to FarmerActivity.jsx")
