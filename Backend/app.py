from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from statistics import mean, stdev

# Import the new functions from storage
from storage import (
    init_db, 
    get_conn, 
    get_last_two_days_prices, 
    get_last_n_days_prices, 
    get_today_prices_by_market,
    get_available_dates,    # <--- NEW
    get_prices_by_date      # <--- NEW
)

app = FastAPI(title="Veglytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Veglytics API running"}

# --- HELPER ---
def get_db_latest_date():
    """Helper to just get the single latest string date"""
    dates = get_available_dates()
    return dates[0] if dates else None

@app.get("/api/meta")
def meta():
    latest = get_db_latest_date()
    return {"latest_date": latest}

@app.get("/api/dates")
def available_dates_endpoint():
    """
    Return last 7 available dates in DB for the dropdown.
    """
    dates = get_available_dates()
    return {"dates": dates}

@app.get("/api/markets")
def markets():
    with get_conn() as conn:
        rows = conn.execute("SELECT DISTINCT market FROM prices ORDER BY market").fetchall()
    return [r[0] for r in rows]

@app.get("/api/commodities")
def commodities():
    with get_conn() as conn:
        rows = conn.execute("SELECT DISTINCT commodity FROM prices ORDER BY commodity").fetchall()
    return [r[0] for r in rows]

@app.get("/api/prices/latest")
def latest_prices(
    market: str = Query(..., description="Market name e.g., Dambulla"),
    search: str = Query("", description="Search commodity contains text"),
    date: str = Query(None, description="Optional date in DB format e.g. 13-01-2026")
):
    """
    Returns prices for a specific market and date (or latest if no date).
    Also calculates change vs the available date prior to the selected one.
    """
    # 1. Determine which date to show
    available_dates = get_available_dates()
    
    if not available_dates:
         return {"date": None, "market": market, "items": []}

    target_date = date if date else available_dates[0]

    # 2. Determine the "previous" date for trend comparison
    # We find the first date in our list that is older than target_date
    # (Since available_dates is sorted newest->oldest)
    prev_date = None
    # If target_date is in our cached list, pick the next one
    if target_date in available_dates:
        idx = available_dates.index(target_date)
        if idx + 1 < len(available_dates):
            prev_date = available_dates[idx + 1]
    
    # If not found in simple list (rare), do a DB lookup for specific previous date
    if not prev_date:
        with get_conn() as conn:
            row = conn.execute(
                "SELECT MAX(date) FROM prices WHERE date < ? AND market = ?", 
                (target_date, market)
            ).fetchone()
            if row and row[0]:
                prev_date = row[0]

    # 3. Fetch data using our clean storage functions
    today_items = get_prices_by_date(market, target_date)
    
    # Create lookup for previous prices
    prev_map = {}
    if prev_date:
        prev_items = get_prices_by_date(market, prev_date)
        prev_map = {item['commodity']: item['price_avg'] for item in prev_items}

    # 4. Combine and Calculate Change
    final_items = []
    
    for item in today_items:
        # Filter by search term
        if search and search.lower() not in item['commodity'].lower():
            continue

        c_name = item['commodity']
        avg = item['price_avg']
        prev_avg = prev_map.get(c_name)
        
        change = None
        change_pct = None
        direction = "same"

        if avg is not None and prev_avg is not None and prev_avg != 0:
            change = avg - prev_avg
            change_pct = (change / prev_avg) * 100
            
            if change > 0:
                direction = "up"
            elif change < 0:
                direction = "down"

        final_items.append({
            "commodity": c_name,
            "raw_price": f"Rs. {item['price_min']} - {item['price_max']}",
            "price_min": item['price_min'],
            "price_max": item['price_max'],
            "price_avg": avg,
            "prev_avg": prev_avg,
            "change": change,
            "change_pct": change_pct,
            "direction": direction
        })

    # Sort A-Z
    final_items.sort(key=lambda x: x['commodity'])

    return {
        "date": target_date, 
        "prev_date": prev_date, 
        "market": market, 
        "items": final_items,
        "total_items": len(final_items)
    }

# --- ANALYTICS ENDPOINTS (Unchanged mostly) ---

@app.get("/api/analysis")
def analyze_price(commodity: str, market: str):
    rows = get_last_two_days_prices(commodity, market)

    if len(rows) < 2:
        return {
            "commodity": commodity,
            "market": market,
            "message": "Not enough data (need at least 2 days)"
        }

    today_date, today_price = rows[0]
    prev_date, prev_price = rows[1]

    if today_price is None or prev_price is None or prev_price == 0:
        change_pct = 0.0
    else:
        change_pct = ((today_price - prev_price) / prev_price) * 100.0

    if change_pct > 2:
        trend = "UP"
    elif change_pct < -2:
        trend = "DOWN"
    else:
        trend = "STABLE"

    return {
        "commodity": commodity,
        "market": market,
        "today": {"date": today_date, "price_avg": round(float(today_price), 2)},
        "yesterday": {"date": prev_date, "price_avg": round(float(prev_price), 2)},
        "change_percent": round(float(change_pct), 2),
        "trend": trend
    }

@app.get("/api/trend7")
def seven_day_trend(commodity: str, market: str):
    rows = get_last_n_days_prices(commodity, market, n=7)

    if len(rows) < 3:
        return {
            "commodity": commodity,
            "market": market,
            "message": "Not enough data for 7-day trend"
        }

    prices = [r[1] for r in rows if r[1] is not None]
    avg_price = sum(prices) / len(prices)

    first = prices[-1] 
    last = prices[0]   

    change_pct = ((last - first) / first) * 100 if first != 0 else 0

    if change_pct > 3:
        trend = "UP"
    elif change_pct < -3:
        trend = "DOWN"
    else:
        trend = "STABLE"

    return {
        "commodity": commodity,
        "market": market,
        "days": len(prices),
        "average_price": round(avg_price, 2),
        "week_change_percent": round(change_pct, 2),
        "trend": trend
    }

@app.get("/api/trend")
def trend(commodity: str, market: str, days: int = 7):
    """Returns actual data points for charts."""
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT date, price_avg, raw_price
            FROM prices
            WHERE commodity = ? AND market = ?
            ORDER BY date DESC
            LIMIT ?
        """, (commodity, market, days)).fetchall()

    rows = list(reversed(rows))
    return {
        "commodity": commodity,
        "market": market,
        "points": [{"date": d, "price_avg": p, "raw_price": r} for (d, p, r) in rows]
    }

@app.get("/api/compare")
def compare(
    commodity: str, 
    markets: str = Query(..., description="Comma separated markets")
):
    latest = get_db_latest_date()
    if not latest:
        return {"date": None, "commodity": commodity, "markets": []}

    market_list = [m.strip() for m in markets.split(",") if m.strip()]
    results = []
    
    with get_conn() as conn:
        for m in market_list:
            row = conn.execute("""
                SELECT raw_price, price_avg
                FROM prices
                WHERE date = ? AND commodity = ? AND market = ?
            """, (latest, commodity, m)).fetchone()

            if row:
                results.append({"market": m, "raw_price": row[0], "price_avg": row[1]})
            else:
                results.append({"market": m, "raw_price": None, "price_avg": None})

    return {"date": latest, "commodity": commodity, "markets": results}

# In backend/app.py

@app.get("/api/recommend")
def recommend_market(commodity: str):
    # 1. Get Today's Prices for Market Comparison
    rows = get_today_prices_by_market(commodity)
    
    # 2. Get Trend Data for "Best Time to Sell" (using Dambulla as benchmark)
    # We grab last 5 days to see the trajectory
    trend_rows = get_last_n_days_prices(commodity, "Dambulla", n=5)
    
    # --- LOGIC: Best Market ---
    if not rows or len(rows) < 2:
        return {"commodity": commodity, "message": "Not enough data"}

    sorted_rows = sorted(rows, key=lambda x: x[1], reverse=True)
    best_market, best_price = sorted_rows[0]
    worst_market, worst_price = sorted_rows[-1]
    price_diff = best_price - worst_price
    
    # Confidence Score
    if len(sorted_rows) >= 3 and price_diff >= 50:
        confidence = "HIGH"
    elif len(sorted_rows) >= 2 and price_diff >= 20:
        confidence = "MEDIUM"
    else:
        confidence = "LOW"

    # --- LOGIC: Best Time to Sell ---
    advice = "HOLD"
    advice_reason = "Insufficient trend data"
    
    if len(trend_rows) >= 3:
        # trend_rows[0] is Today, [1] is Yesterday, etc.
        p0 = trend_rows[0][1] # Today
        p1 = trend_rows[1][1] # Yesterday
        p2 = trend_rows[2][1] # Day before
        
        if p0 > p1 and p1 >= p2:
            advice = "WAIT"
            advice_reason = "Price is rising steadily. Wait 1-2 days."
        elif p0 < p1 and p1 <= p2:
            advice = "SELL NOW"
            advice_reason = "Price is dropping. Sell before it falls further."
        elif abs(p0 - p1) < 5:
            advice = "SELL OR WAIT"
            advice_reason = "Market is stable. Safe to sell."
        else:
            advice = "WATCH"
            advice_reason = "Market is volatile."

    return {
        "commodity": commodity,
        "best_market": best_market,
        "best_price": round(best_price, 2),
        "worst_market": worst_market,
        "worst_price": round(worst_price, 2),
        "price_difference": round(price_diff, 2),
        "confidence": confidence,
        "markets_checked": len(sorted_rows),
        "all_markets": [{"market": m, "price_avg": round(p, 2)} for m, p in sorted_rows],
        
        # New Data Fields
        "advice": advice,
        "advice_reason": advice_reason
    }

@app.get("/api/volatility")
def price_volatility(commodity: str, market: str):
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT date, price_avg
            FROM prices
            WHERE commodity = ? AND market = ?
            ORDER BY date DESC
            LIMIT 7
        """, (commodity, market)).fetchall()

    if len(rows) < 3:
        return {
            "commodity": commodity,
            "market": market,
            "message": "Not enough data for volatility"
        }

    prices = [r[1] for r in rows if r[1] is not None]
    avg_price = mean(prices)
    volatility_pct = round((stdev(prices) / avg_price) * 100, 2)

    if volatility_pct <= 5:
        risk = "LOW"
    elif volatility_pct <= 12:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    return {
        "commodity": commodity,
        "market": market,
        "average_price": round(avg_price, 2),
        "volatility_percent": volatility_pct,
        "risk_level": risk,
        "days_used": len(prices)
    }