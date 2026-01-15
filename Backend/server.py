from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import uvicorn

app = FastAPI()

# --- CORS CONFIGURATION ---
# This is critical. It allows your React app (running on a different port)
# to request data from this Python server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (good for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],
)

CSV_FILE = "latest_data.csv"

@app.get("/")
def read_root():
    return {"message": "Vegetable Price API is running!"}

@app.get("/api/prices")
def get_prices():
    """
    Reads the CSV file and returns the data as a JSON list.
    """
    if not os.path.exists(CSV_FILE):
        return []
    
    # Read CSV and fill any missing values (NaN) with "N/A"
    # This prevents errors in the Frontend
    df = pd.read_csv(CSV_FILE).fillna("N/A")
    
    # Convert DataFrame to a list of dictionaries
    # Example: [{'Commodity': 'Carrot', 'Colombo': '200', ...}, {...}]
    data = df.to_dict(orient='records')
    return data

if __name__ == "__main__":
    print("Starting FastAPI Server on Port 8000...")
    # 'reload=True' means the server restarts if you change code (useful for dev)
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)