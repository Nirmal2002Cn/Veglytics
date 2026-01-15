import os
import re
import requests
import pdfplumber
from datetime import datetime
from typing import Dict, List, Tuple, Optional

from storage import init_db, upsert_price
from utils import parse_price

# -----------------------------
# CONFIG
# -----------------------------
BULLETIN_PAGE = "https://www.harti.gov.lk/index.php/en/market-information/data-food-commodities-bulletin"
BASE = "https://www.harti.gov.lk"
DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

TARGET_MARKETS = ["Colombo", "Dambulla", "Nuwara Eliya"]

VEG_KEYWORDS = [
    "carrot", "beans", "leeks", "cabbage", "brinjal", "tomato",
    "pumpkin", "lime", "chilli", "okra", "beet", "capsicum",
    "banana", "cucumber", "radish", "green", "ladies", "bitter"
]

# -----------------------------
# OPTION 1: Sinhala name cleaning + mapping
# -----------------------------
NAME_MAP = {
    "තක්කාලි": "Tomato",
    "කැරට්": "Carrot",
    "බෝංචි": "Beans",
    "දිග බෝංචි": "Long Beans",
    "ගෝවා": "Cabbage",
    "වට්ටක්කා": "Pumpkin",
    "වම්බටු": "Brinjal",
    "බීට්": "Beetroot",
    "බීට්රූට්": "Beetroot",
    "ලීක්": "Leeks",
    "ලීක්ස්": "Leeks",
    "පිපිඤ්ඤා": "Cucumber",
    "දෙහි": "Lime",
    "මිරිස්": "Green Chillies",
    "අමු මිරිස්": "Green Chillies",
    "බණ්ඩක්කා": "Ladies Fingers",
    "රාබු": "Radish",
    "කරවිල": "Bitter Gourd",
    "පතෝල": "Snake Gourd",
    "ලූනු": "Big Onion",
    "ලොකු ලූනු": "Big Onion",
    "අල": "Potato",
}


GARBAGE_WORDS = [
    "vegetable", "variety", "up country", "low country",
    "wholesale", "retail", "price", "market", "bulletin"
]
FRUIT_START_WORDS = ["banana", "pineapple", "papaw", "mango", "avocado", "orange", "grapes", "water melon", "wood apple"]



def is_fruit_section_start(name: str) -> bool:
    n = (name or "").strip().lower()
    return any(n == f or n.startswith(f) for f in FRUIT_START_WORDS)


def page_score_for_veg(text:str)-> int:
    t=(text or "").lower()
    if not t.strip():
        return 0
    
    score = 0


    if "variety" in t: score += 5
    if "peliyagoda" in t: score += 8
    if "dambulla" in t: score += 8
    if "nuwara" in t: score += 6
    if "nuwaraeliya" in t or "nuwara eliya" in t: score += 8


    veg_hits = sum(1 for k in VEG_KEYWORDS if k in t)
    score += veg_hits * 2
    return score


def find_best_veg_pages(pdf: pdfplumber.PDF, top_k: int = 2) -> List[int]:
    scored = []
    for i, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        s = page_score_for_veg(text)
        scored.append((s, i))

    scored.sort(reverse=True, key=lambda x: x[0])
    best = [i for (s, i) in scored if s > 0][:top_k]
    return best


def is_size_variant(name:str) -> bool:
    n = (name or "").strip().lower()
    return n in ["- small", "- medium", "- large", "small", "medium", "large"] or n.startswith("- small") or n.startswith("- medium") or n.startswith("- large")
 
def is_header_like(name:str)-> bool:
    n = (name or "").strip().lower()
    return ("rs" in n and "kg" in n) or "variety" in n or "commodity" in n or "market" in n

def is_valid_price_cell(raw: str) -> bool:
    if raw is None:
        return False

    s = str(raw).replace(",", "").strip()
    if s in ["-", "N/A", "None", "none", ""]:
        return False

    # Accept: "250", "250.00", "250-270", "250 - 270"
    return bool(re.fullmatch(r"\d+(\.\d+)?(\s*-\s*\d+(\.\d+)?)?", s))






def normalize_name(s: str) -> str:
    s = (str(s) if s is not None else "").replace("\n", " ")
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"[•|/\\]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def is_junk_name(s: str) -> bool:
    if not s or s in ["-", "N/A", "None"]:
        return True

    # very short (broken glyphs)
    if len(s) < 3:
        return True

    low = s.lower()

    # name should not contain digits or date-like strings
    if re.search(r"\d", s):
        return True
    if re.search(r"\d{4}[-./]\d{2}[-./]\d{2}", s):
        return True

    # header / garbage words
    if any(w in low for w in GARBAGE_WORDS):
        return True

    # merged paragraph
    if len(s) > 45:
        return True

    return False

def clean_commodity_name(raw: str) -> str:
    n = normalize_name(raw)
    if is_junk_name(n):
        return ""

    # Sinhala exact match -> English
    if n in NAME_MAP:
        return NAME_MAP[n]

    # Sinhala partial match -> English (for broken Sinhala)
    for key, english in NAME_MAP.items():
        if key in n:
            return english

    # If already English, keep it (clean + Title Case)
    # Example: "cabbage (imported)" -> "Cabbage (Imported)"
    if re.match(r"^[A-Za-z\s\(\)\-\/\.,]+$", n):
        return n.title()

    # Otherwise it is unknown/broken -> skip
    return ""



# -----------------------------
# 1) Get latest PDF link (reliable)
# -----------------------------
def get_latest_pdf_url() -> Tuple[Optional[str], Optional[str]]:
    html = requests.get(BULLETIN_PAGE, timeout=25).text

    pattern = re.compile(
        r"Daily\s+Food\s+Commodities\s+Bulletin\s*\((\d{2}-\d{2}-\d{4})\).*?href=\"([^\"]+\.pdf)\"",
        re.IGNORECASE | re.DOTALL
    )

    matches = pattern.findall(html)
    if not matches:
        return None, None

    records = []
    for date_str, href in matches:
        try:
            date_obj = datetime.strptime(date_str, "%d-%m-%Y")
        except ValueError:
            continue

        if not href.startswith("http"):
            href = BASE + href if href.startswith("/") else BASE + "/" + href

        records.append((date_obj, href))

    if not records:
        return None, None

    latest_date, latest_url = max(records, key=lambda x: x[0])
    return latest_url, latest_date.strftime("%d-%m-%Y")


def download_pdf(url: str, date_str: str) -> str:
    filename = os.path.join(DOWNLOAD_DIR, f"prices_{date_str}.pdf")
    r = requests.get(url, timeout=40)
    r.raise_for_status()
    with open(filename, "wb") as f:
        f.write(r.content)
    return filename

def get_latest_n_pdf_urls(n=7) -> List[Tuple[str, str]]:
    """
    Returns list of (url, date_str) for latest N bulletins.
    """
    html = requests.get(BULLETIN_PAGE, timeout=25).text

    pattern = re.compile(
        r"Daily\s+Food\s+Commodities\s+Bulletin\s*\((\d{2}-\d{2}-\d{4})\).*?href=\"([^\"]+\.pdf)\"",
        re.IGNORECASE | re.DOTALL
    )

    matches = pattern.findall(html)
    if not matches:
        return []

    records = []
    for date_str, href in matches:
        try:
            date_obj = datetime.strptime(date_str, "%d-%m-%Y")
        except ValueError:
            continue

        if not href.startswith("http"):
            href = BASE + href if href.startswith("/") else BASE + "/" + href

        records.append((date_obj, href, date_str))

    # sort latest first
    records.sort(reverse=True, key=lambda x: x[0])

    # pick latest N
    return [(r[1], r[2]) for r in records[:n]]



# -----------------------------
# 2) Find vegetable page index
# -----------------------------
def find_veg_page_index(pdf: pdfplumber.PDF) -> int:
    best_idx = 1
    best_score = 0

    for i, page in enumerate(pdf.pages):
        text = (page.extract_text() or "").lower()
        if not text:
            continue
        score = sum(1 for k in VEG_KEYWORDS if k in text)
        if score > best_score:
            best_score = score
            best_idx = i

    return best_idx


# -----------------------------
# 3) Table helpers
# -----------------------------
def normalize_cell(x) -> str:
    return "-" if x is None else str(x).replace("\n", " ").strip()




def extract_tables_from_page(page) -> List[List[List[str]]]:
    settings = {
           "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "intersection_tolerance": 5,
        "snap_tolerance": 3,
        "join_tolerance": 3,
        "edge_min_length": 3,
        "min_words_vertical": 1,
        "min_words_horizontal": 1,
        "keep_blank_chars": False,
    }

    try:
        tables = page.extract_tables(settings) or []
    except TypeError:
        # If even positional isn't supported, fall back to default
        tables = page.extract_tables() or []

    if not tables:
        try:
            one = page.extract_table(settings)
        except TypeError:
            one = page.extract_table()
        if one:
            tables = [one]

    out = []
    for t in tables:
        if not t or len(t) < 3:
            continue
        out.append([[normalize_cell(c) for c in row] for row in t])
    return out





def looks_like_header_row(row: List[str]) -> bool:
    joined = " ".join(row).lower()
    return any(k in joined for k in [
        "variety", "commodity", "market",
        "colombo", "dambulla", "nuwara", "peliyagoda",
        "rs", "kg"
    ])


def rows_from_table(table: List[List[str]]) -> List[List[str]]:
    data_rows = []
    for r in table:
        if not r:
            continue
        if looks_like_header_row(r):
            continue
        data_rows.append(r)
    return data_rows

def build_market_column_map(table: List[List[str]]) -> Dict[str, int]:
    header_candidates = table[:3]
    col_count = max(len(r) for r in table[:5])

    col_keywords = {
        "Colombo": ["peliyagoda"],
        "Dambulla": ["dambulla"],
        "Nuwara Eliya": ["nuwara", "eliya", "nuwaraeliya"],
    }

    col_texts = [""] * col_count
    for r in header_candidates:
        for ci in range(col_count):
            if ci < len(r):
                col_texts[ci] += " " + (r[ci] or "")

    col_texts = [t.lower() for t in col_texts]

    market_map = {}
    for market in TARGET_MARKETS:
        keys = col_keywords[market]
        for ci, txt in enumerate(col_texts):
            if any(k in txt for k in keys):
                market_map[market] = ci
                break

    # fallback indices (common layout)
    market_map.setdefault("Colombo", 1)
    market_map.setdefault("Dambulla", 3)
    market_map.setdefault("Nuwara Eliya", 8)
    return market_map


# -----------------------------
# 4) Extract veg data
# -----------------------------
def extract_veg_data(pdf_filename: str) -> Tuple[str, List[Dict]]:
    m = re.search(r"prices_(\d{2}-\d{2}-\d{4})\.pdf", os.path.basename(pdf_filename))
    date_str = m.group(1) if m else datetime.now().strftime("%d-%m-%Y")

    records = []

    with pdfplumber.open(pdf_filename) as pdf:
        veg_idx = find_veg_page_index(pdf)

        # vegetables may continue across multiple pages
        page_indices =find_best_veg_pages(pdf,top_k=2)

        if not page_indices:
            page_indices= list(range(len(pdf.pages)))

        for pi in page_indices:
            page = pdf.pages[pi]
            tables = extract_tables_from_page(page)

            for table in tables:
                market_map = build_market_column_map(table)
                data = rows_from_table(table)

                for row in data:
                    if len(row) < 2:
                        continue

                    # ✅ APPLY Sinhala cleaning here
                    commodity = clean_commodity_name(row[0])
                    if not commodity:
                        continue
                    if is_fruit_section_start(str(row[0])):
                         break
                    if is_size_variant(commodity):
                        continue
                    if is_header_like(commodity):
                        continue
                  

                    for market, col_idx in market_map.items():
                        if col_idx >= len(row):
                            continue

                        raw = normalize_cell(row[col_idx])

                        # skip obvious junk cells
                        if not is_valid_price_cell(raw):
                            continue

                        pmin, pmax, pavg = parse_price(raw)

                        records.append({
                            "date": date_str,
                            "commodity": commodity,
                            "market": market,
                            "raw": raw,
                            "pmin": pmin,
                            "pmax": pmax,
                            "pavg": pavg,
                        })

    return date_str, records


# -----------------------------
# 5) Run job
# -----------------------------
def run_job():
    init_db()

    print("Checking latest bulletin PDF...")

    pdfs = get_latest_n_pdf_urls(n=7)

    if not pdfs:
        print("ERROR: Could not find bulletin PDF links.")
        return

    total_stored = 0

    for url, date_str in pdfs:
        print(f"\n--- Processing bulletin {date_str} ---")
        pdf_file = download_pdf(url, date_str)

        _, records = extract_veg_data(pdf_file)

        stored = 0
        for r in records:
            upsert_price(r["date"], r["commodity"], r["market"], r["raw"], r["pmin"], r["pmax"], r["pavg"])
            stored += 1

        total_stored += stored
        print(f"Stored {stored} rows for {date_str}")

    print(f"\n✅ DONE: Stored total {total_stored} rows for last 7 days")




if __name__ == "__main__":
    run_job()
