# 🥬 Veglytics – Sri Lankan Vegetable Price Analytics Dashboard

Veglytics is a **full-stack Business Intelligence web application** designed to analyze daily vegetable prices in Sri Lanka and provide **actionable insights** for farmers and traders.

The system processes official **HARTI Daily Food Commodity Bulletins**, stores historical prices, and performs trend, comparison, and volatility analysis through an interactive dashboard.

---

## 🎯 Problem Statement
Farmers often sell vegetables without knowing:
- Whether prices are rising or falling
- Which market gives the best return today
- How risky price fluctuations are

**Veglytics solves this problem using data-driven insights.**

---

## 🚀 Key Features
- 📊 **Daily Price Dashboard** – View vegetable prices by market
- 📈 **7-Day Trend Analysis** – Identify UP / DOWN / STABLE trends
- 🧠 **Best Market Recommendation** – Suggests where to sell today
- ⚠️ **Volatility & Risk Indicator** – Low / Medium / High price risk
- 🔍 **Market Comparison** – Colombo vs Dambulla vs Nuwara Eliya
- 🖼️ **Visual Cards** – Product images with price and trend badges

---

## 🛠️ Technology Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Recharts (Data Visualization)

### Backend
- Python
- FastAPI
- SQLite

### Data Engineering
- PDF scraping using `pdfplumber`
- Price normalization & aggregation
- Statistical analysis (mean, percentage change, volatility)



📸 Screenshots



<img width="1326" height="623" alt="image" src="https://github.com/user-attachments/assets/576f0eaf-7660-4a04-b39e-6d1b4d33562c" />
<img width="1321" height="624" alt="image" src="https://github.com/user-attachments/assets/2e120129-0f29-4f77-8718-6afb692b664b" />



⚙️ How to Run Locally
1️⃣ Clone the Repository
git clone https://github.com/Nirmal2002Cn/Veglytics.git
cd Veglytics

2️⃣ Backend Setup
cd Backend
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt

# Fetch latest price data
python scraper.py

# Start API server
uvicorn app:app --reload


Backend will run at:

http://localhost:8000

3️⃣ Frontend Setup
cd Frontend
npm install
npm run dev


Frontend will run at:

http://localhost:5173

## 🎓 Academic Context
This project was developed as a self-initiated academic and portfolio project to strengthen skills in:
* **Business Intelligence:** Deriving actionable insights from raw data.
* **Full-stack Development:** Integrating a Python data backend with a modern React frontend.
* **Data Visualization:** Creating intuitive charts for non-technical users (farmers).
* **Real-world Data Processing:** Handling messy PDF data and automating ETL pipelines.
📌 Future Improvements

- Price prediction using time-series models

- Seasonal trend detection

- User-selectable date ranges

- Mobile-first UI optimization

- Cloud deployment

👤 Author

Chamila Nirmal
BSc (Hons) in Information & Communication Technology
Uva Wellassa University, Sri Lanka

GitHub: https://github.com/Nirmal2002Cn

