import requests

print("🚀 Categorizing all transactions...")
response = requests.post(
    "http://localhost:5001/api/categorize-all",
    json={"user_id": "aman"}
)

if response.status_code == 200:
    result = response.json()
    print(f"\n✅ SUCCESS!")
    print(f"📊 Transactions found: {result.get('transactions_found', 0)}")
    print(f"✨ Categorized: {result.get('categorized', 0)}")
    print(f"💎 Points calculated: {result.get('points_calculated', 0)}")
else:
    print(f"❌ Error: {response.text}")
