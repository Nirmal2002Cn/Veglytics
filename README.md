🎯 Problem Statement

Sri Lankan farmers often face uncertainty when deciding:

Whether to sell vegetables today or wait

Which market offers the best price

How risky current price movements are

Veglytics addresses this problem by transforming raw market data into clear, actionable insights.

🚀 Key Features

Daily Price Dashboard
View vegetable prices by market (Dambulla, Colombo, Nuwara Eliya)

Price Change & Trend Analysis
Day-to-day percentage change with UP / DOWN / STABLE indicators

7-Day Trend Insights
Weekly average price and trend direction

Best Market Recommendation
Suggests where to sell today based on highest price

Confidence Level Indicator
HIGH / MEDIUM / LOW confidence based on price gaps and data coverage

Market Comparison Charts
Compare prices across multiple markets

Volatility & Risk Analysis
Identifies LOW / MEDIUM / HIGH price risk using statistical variation

Product-Focused UI
Vegetable cards with images, prices, and trend badges

🛠️ Technology Stack
Frontend

React.js (Vite)

Tailwind CSS

Recharts (Data Visualization)

Backend

Python

FastAPI (REST API)

Database

SQLite (Relational storage for historical prices)

Data Engineering & Analysis

PDF scraping using pdfplumber

Data cleaning & normalization

Percentage change, averages, and volatility calculations

🧠 Business Intelligence Logic

Veglytics applies simple but effective BI rules:

Trend Detection
Based on percentage price change thresholds

Market Recommendation
Highest average price across markets

Confidence Level
Derived from:

Number of markets available

Price difference between best and worst market

Volatility Index
Standard deviation over recent prices to estimate risk

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

🎓 Academic Context

This project was developed as a self-initiated academic and portfolio project to strengthen skills in:

Business Intelligence

Full-stack web development

Data analysis and visualization

Real-world data processing

📌 Future Improvements

Price prediction using time-series models

Seasonal trend detection

User-selectable date ranges

Mobile-first UI optimization

Cloud deployment

👤 Author

Chamila Nirmal
BSc (Hons) in Information & Communication Technology
Uva Wellassa University, Sri Lanka

GitHub: https://github.com/Nirmal2002Cn

