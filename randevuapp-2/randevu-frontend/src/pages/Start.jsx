import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Start() {
    const nav = useNavigate();
    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");
    const [telefon, setTelefon] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            await api.post("/api/auth/request-code", { ad, soyad, telefon });
            nav("/otp", { state: { telefon, ad, soyad } });
        } catch (ex) {
            setErr(ex?.response?.data?.message || "Kod gönderilemedi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="w-full max-w-md">
                {/* Logo/Header Section */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Randevu Sistemi</h1>
                    <p className="text-gray-600 mt-2">Hızlı ve kolay randevu alın</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Hoş Geldiniz</h2>
                        <p className="text-sm text-gray-600 mt-1">Devam etmek için bilgilerinizi girin</p>
                    </div>

                    {err && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                            <p className="text-sm text-red-700 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {err}
                            </p>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={submit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Ad</label>
                            <input
                                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                placeholder="Adınızı girin"
                                value={ad}
                                onChange={(e) => setAd(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Soyad</label>
                            <input
                                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                placeholder="Soyadınızı girin"
                                value={soyad}
                                onChange={(e) => setSoyad(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Telefon</label>
                            <input
                                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                placeholder="05XX XXX XX XX"
                                type="tel"
                                value={telefon}
                                onChange={(e) => setTelefon(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Gönderiliyor...</span>
                                </>
                            ) : (
                                <>
                                    <span>Devam Et</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}