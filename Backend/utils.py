import re

def parse_price(raw: str):
    if raw is None:
        return None, None, None

    s = str(raw).replace(",", "").strip()
    if s in ["-", "N/A", "None", ""]:
        return None, None, None

    m = re.match(r"^(\d+(\.\d+)?)(\s*-\s*(\d+(\.\d+)?))?$", s)
    if not m:
        return None, None, None

    a = float(m.group(1))
    if m.group(4):
        b = float(m.group(4))
        mn, mx = min(a, b), max(a, b)
        return mn, mx, (mn + mx) / 2

    return a, a, a
