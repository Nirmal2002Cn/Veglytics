import sqlite3
from pathlib import Path

# ✅ FIX 1: Vercel Path Configuration
# This ensures Python looks in the correct folder (Backend) for the database,
# instead of the server root.
BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "veglytics.db"

def get_conn():
    return sqlite3.connect(str(DB_FILE))

def init_db():
    with get_conn() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            commodity TEXT NOT NULL,
            market TEXT NOT NULL,
            raw_price TEXT,
            price_min REAL,
            price_max REAL,
            price_avg REAL,
            UNIQUE(date, commodity, market)
        );
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_prices_lookup ON prices(date, market, commodity);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_prices_trend ON prices(commodity, market, date);")

def upsert_price(date: str, commodity: str, market: str, raw: str, pmin, pmax, pavg):
    with get_conn() as conn:
        conn.execute("""
        INSERT OR REPLACE INTO prices(date, commodity, market, raw_price, price_min, price_max, price_avg)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (date, commodity, market, raw, pmin, pmax, pavg))

# ✅ FIX 2: Date Sorting Helper
# Converts DD-MM-YYYY -> YYYYMMDD string for correct sorting in SQL
SORT_BY_DATE_DESC = "ORDER BY substr(date, 7, 4) || substr(date, 4, 2) || substr(date, 1, 2) DESC"

def get_last_two_days_prices(commodity: str, market: str):
    """
    Returns latest 2 rows for a commodity+market ordered by date (newest first).
    """
    with get_conn() as conn:
        cur = conn.execute(f"""
            SELECT date, price_avg
            FROM prices
            WHERE commodity = ? AND market = ?
              AND price_avg IS NOT NULL
            {SORT_BY_DATE_DESC}
            LIMIT 2
            """, (commodity, market))
        return cur.fetchall()

def get_last_n_days_prices(commodity: str, market: str, n: int = 7):
    with get_conn() as conn:
        cur = conn.execute(f"""
            SELECT date, price_avg
            FROM prices
            WHERE commodity = ? AND market = ?
              AND price_avg IS NOT NULL
            {SORT_BY_DATE_DESC}
            LIMIT ?
            """, (commodity, market, n))
        return cur.fetchall()
    
def get_today_prices_by_market(commodity: str):
    """
    Returns today's prices for a commodity across all markets.
    """
    with get_conn() as conn:
        # We first find the true latest date for this commodity
        cur_date = conn.execute(f"""
            SELECT date FROM prices 
            WHERE commodity = ? 
            {SORT_BY_DATE_DESC} 
            LIMIT 1
        """, (commodity,)).fetchone()
        
        if not cur_date:
            return []
            
        latest_date = cur_date[0]

        cur = conn.execute("""
            SELECT market, price_avg
            FROM prices
            WHERE commodity = ?
              AND date = ?
              AND price_avg IS NOT NULL
            """, (commodity, latest_date))
        return cur.fetchall()

# --- NEW FUNCTIONS FOR DATE FILTERING ---

def get_available_dates():
    """Returns the last 7 distinct dates available in the database."""
    with get_conn() as conn:
        cur = conn.execute(f"""
            SELECT DISTINCT date 
            FROM prices 
            {SORT_BY_DATE_DESC}
            LIMIT 7
        """)
        rows = cur.fetchall()
        return [r[0] for r in rows]

def get_prices_by_date(market: str, date_str: str):
    """Get prices for a specific market and date."""
    with get_conn() as conn:
        cur = conn.execute("""
            SELECT commodity, price_min, price_max, price_avg
            FROM prices
            WHERE market = ? AND date = ?
        """, (market, date_str))
        
        items = []
        for row in cur.fetchall():
            items.append({
                "commodity": row[0],
                "price_min": row[1],
                "price_max": row[2],
                "price_avg": row[3]
            })
        return items