"""
Analytics Routes
- Top of file data
- Cashflow analytics
- Alerts
- Spending trends
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api')


def get_snowflake():
    try:
        from snowflake_db import get_db
        return get_db()
    except Exception as e:
        print(f"Snowflake not available: {e}")
        return None


@analytics_bp.route("/top-of-file", methods=["GET"])
def top_of_file():
    """Get top of file data - payment methods per merchant"""
    db = get_snowflake()
    if not db:
        return jsonify({"data": []})
    
    user_id = request.args.get("user_id", "test_user")
    
    try:
        merchants = db.get_merchants(user_id)
        return jsonify({"data": merchants})
    except Exception as e:
        return jsonify({"error": str(e), "data": []}), 200


@analytics_bp.route("/cashflow", methods=["GET", "POST"])
def cashflow():
    """Get cashflow analytics from Snowflake"""
    db = get_snowflake()
    if not db:
        return jsonify({"error": "Snowflake not configured", "by_category": []}), 200
    
    data = request.json if request.method == "POST" else {}
    user_id = data.get("user_id", request.args.get("user_id", "test_user"))
    days = int(data.get("days", request.args.get("days", 30)))
    
    try:
        result = db.get_cashflow(user_id, days)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e), "by_category": []}), 200


@analytics_bp.route("/alerts", methods=["GET"])
def alerts():
    """Get alerts - spending anomalies, bill reminders, etc."""
    # Placeholder - in production, analyze transactions for:
    # - Unusual spending patterns
    # - Upcoming bills
    # - Category budget warnings
    return jsonify({"alerts": []})


@analytics_bp.route("/categorize/<tx_id>", methods=["POST"])
def categorize_transaction(tx_id):
    """AI-categorize a single transaction"""
    db = get_snowflake()
    if not db:
        return jsonify({"error": "Snowflake not configured"}), 500
    
    try:
        result = db.categorize_transaction_ai(tx_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/categorize-all", methods=["POST"])
def categorize_all():
    """Batch categorize all uncategorized transactions"""
    db = get_snowflake()
    if not db:
        return jsonify({"error": "Snowflake not configured"}), 500
    
    data = request.json or {}
    user_id = data.get("user_id")
    
    try:
        result = db.process_all_uncategorized(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/calculate-points/<tx_id>", methods=["POST"])
def calculate_points(tx_id):
    """Calculate points for a transaction based on card benefits"""
    db = get_snowflake()
    if not db:
        return jsonify({"error": "Snowflake not configured"}), 500
    
    data = request.json or {}
    card_id = data.get("card_id")
    
    try:
        result = db.calculate_points(tx_id, card_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/spending-by-category", methods=["GET", "POST"])
def spending_by_category():
    """Get spending breakdown by AI-categorized spend_category"""
    db = get_snowflake()
    if not db:
        return jsonify({"error": "Snowflake not configured", "categories": []}), 200
    
    data = request.json if request.method == "POST" else {}
    user_id = data.get("user_id", request.args.get("user_id", "test_user"))
    days = int(data.get("days", request.args.get("days", 30)))
    
    try:
        # Uses the new spend_category field
        conn, cursor = db._get_connection()
        cursor.execute("""
            SELECT 
                COALESCE(spend_category, 'uncategorized') AS category,
                COUNT(*) AS transaction_count,
                SUM(total_amount) AS total_spent,
                SUM(points_earned) AS total_points
            FROM TRANSACTIONS
            WHERE user_id = %s
              AND datetime >= DATEADD(day, -%s, CURRENT_TIMESTAMP())
            GROUP BY spend_category
            ORDER BY total_spent DESC
        """, (user_id, days))
        
        rows = cursor.fetchall()
        categories = []
        for row in rows:
            categories.append({
                "category": row[0],
                "transaction_count": row[1],
                "total_spent": float(row[2]) if row[2] else 0,
                "total_points": int(row[3]) if row[3] else 0
            })
        
        return jsonify({
            "user_id": user_id,
            "days": days,
            "categories": categories
        })
    except Exception as e:
        return jsonify({"error": str(e), "categories": []}), 200


@analytics_bp.route("/backfill-payment-methods", methods=["POST"])
def backfill_payment_methods():
    """Backfill payment_method from raw transaction data"""
    db = get_snowflake()
    if not db:
        return jsonify({"error": "Snowflake not configured"}), 500
    
    try:
        result = db.backfill_payment_methods()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/recalculate-points", methods=["POST"])
def recalculate_points():
    """Recalculate all points (PayPal = 0)"""
    db = get_snowflake()
    if not db:
        return jsonify({"error": "Snowflake not configured"}), 500
    
    try:
        result = db.recalculate_all_points()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/transactions", methods=["GET"])
def get_transactions():
    """Get raw transactions list from Snowflake"""
    db = get_snowflake()
    if not db:
        return jsonify({"error": "Snowflake not configured", "transactions": []}), 500

    user_id = request.args.get("user_id", "aman")
    merchant_id = request.args.get("merchant_id")
    limit = int(request.args.get("limit", 100))

    try:
        if merchant_id:
            merchant_id = int(merchant_id)

        transactions = db.get_transactions(user_id, merchant_id, limit)
        return jsonify({"transactions": transactions})
    except Exception as e:
        return jsonify({"error": str(e), "transactions": []}), 500


@analytics_bp.route("/spending-trends", methods=["GET", "POST"])
def spending_trends():
    """
    Get spending trends aggregated by month.
    Returns monthly spending totals for charting.
    """
    db = get_snowflake()
    data = request.json if request.method == "POST" else {}
    user_id = data.get("user_id", request.args.get("user_id", "aman"))
    months = int(data.get("months", request.args.get("months", 6)))

    if not db:
        # Return sample data when Snowflake not configured
        return jsonify({
            "source": "sample",
            "message": "Using sample data. Configure Snowflake for live data.",
            "trends": _get_sample_spending_trends(months)
        })

    try:
        conn, cursor = db._get_connection()
        cursor.execute("""
            SELECT
                DATE_TRUNC('month', datetime) AS month,
                SUM(total_amount) AS total_spent
            FROM TRANSACTIONS
            WHERE user_id = %s
              AND datetime >= DATEADD(month, -%s, CURRENT_TIMESTAMP())
            GROUP BY DATE_TRUNC('month', datetime)
            ORDER BY month ASC
        """, (user_id, months))

        rows = cursor.fetchall()

        if not rows:
            return jsonify({
                "source": "sample",
                "message": "No spending data found. Using sample data.",
                "trends": _get_sample_spending_trends(months)
            })

        trends = []
        for row in rows:
            month_date = row[0]
            if isinstance(month_date, str):
                month_date = datetime.strptime(month_date[:10], "%Y-%m-%d")
            trends.append({
                "month": month_date.strftime("%b"),
                "amount": float(row[1]) if row[1] else 0
            })

        return jsonify({
            "source": "snowflake",
            "user_id": user_id,
            "months": months,
            "trends": trends
        })
    except Exception as e:
        return jsonify({
            "source": "sample",
            "error": str(e),
            "message": "Error fetching from Snowflake. Using sample data.",
            "trends": _get_sample_spending_trends(months)
        })


def _get_sample_spending_trends(months=6):
    """Return sample spending data for demo purposes"""
    today = datetime.now()
    sample_data = []

    # Predefined spending pattern - varies independently from income
    # Pattern: moderate start, dip, spike (holidays), normalize
    spending_pattern = [2850, 2600, 3100, 3950, 3400, 2900]

    for i in range(months - 1, -1, -1):
        month_date = today - timedelta(days=30 * i)
        month_label = month_date.strftime("%b")

        # Use predefined pattern with slight random variation
        pattern_index = (months - 1 - i) % len(spending_pattern)
        amount = spending_pattern[pattern_index]

        sample_data.append({
            "month": month_label,
            "amount": round(amount, 2)
        })

    return sample_data

