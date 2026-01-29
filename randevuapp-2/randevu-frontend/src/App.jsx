import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./pages/Start";
import Otp from "./pages/Otp";
import Randevu from "./pages/Randevu";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Start />} />
                <Route path="/otp" element={<Otp />} />
                <Route path="/randevu" element={<Randevu />} />
            </Routes>
        </BrowserRouter>
    );
}