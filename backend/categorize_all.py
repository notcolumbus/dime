"""
Script to categorize all existing transactions in Snowflake
Run this once to backfill categories for all transactions with NULL spend_category
"""

from snowflake_db import get_db

def main():
    print("🚀 Starting bulk categorization of all uncategorized transactions...")
    print("=" * 60)
    
    db = get_db()
    
    # Run categorization for all uncategorized transactions
    result = db.process_all_uncategorized(user_id="aman")
    
    print("\n" + "=" * 60)
    print("✅ CATEGORIZATION COMPLETE")
    print("=" * 60)
    print(f"📊 Total transactions found: {result['transactions_found']}")
    print(f"✨ Successfully categorized: {result['categorized']}")
    print(f"💎 Points calculated: {result['points_calculated']}")
    print("=" * 60)
    
    if result['categorized'] > 0:
        print("\n✅ All transactions have been categorized!")
        print("🎯 Categories are now visible in the Spending page")
    else:
        print("\n⚠️  No uncategorized transactions found (they may already be categorized)")

if __name__ == "__main__":
    main()
