import { BrowserRouter, Routes, Route } from "react-router-dom";
import PricesPage from "./pages/PricesPage";
import CommodityPage from "./pages/CommodityPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PricesPage />} />
        
        {/* ✅ FIX: Add /:market to match the URL sent by PriceCard */}
        <Route path="/commodity/:name/:market" element={<CommodityPage />} />
        
      </Routes>
    </BrowserRouter>
  );
}