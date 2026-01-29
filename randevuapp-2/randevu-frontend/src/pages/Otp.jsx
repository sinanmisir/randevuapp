import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Otp() {
    const nav = useNavigate();
    const { state } = useLocation();
    const telefon = state?.telefon || "";
    const ad = state?.ad || "";
    const soyad = state?.soyad || "";

    const [kod, setKod] = useState("");
    const [sec, setSec] = useState(120);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const canResend = useMemo(() => sec <= 0, [sec]);

    useEffect(() => {
        if (!telefon) nav("/", { replace: true });
    }, [telefon, nav]);

    useEffect(() => {
        if (sec <= 0) return;
        const t = setInterval(() => setSec((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [sec]);

    const verify = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            const res = await api.post("/api/auth/verify-code", { telefon, kod });
            localStorage.setItem("token", res.data.token);
            nav("/randevu", { state: { ad, soyad } });
        } catch (ex) {
            setErr(ex?.response?.data?.message || "Kod doğrulanamadı.");
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        setErr("");
        setLoading(true);
        try {
            await api.post("/api/auth/request-code", { ad, soyad, telefon });
            setSec(120);
        } catch (ex) {
            setErr(ex?.response?.data?.message || "Tekrar kod gönderilemedi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <button
                    onClick={() => nav('/')}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Geri</span>
                </button>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4 animate-bounce">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Doğrulama Kodu</h2>
                        <p className="text-sm text-gray-600 mt-2">Telefonunuza gönderilen 4 haneli kodu girin</p>
                    </div>

                    {err && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                            <p className="text-sm text-red-700 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {err}
                            </p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={verify}>
                        <div className="space-y-2">
                            <input
                                className="w-full border-2 border-gray-200 rounded-xl p-6 text-center text-3xl font-bold tracking-[1em] focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none"
                                placeholder="••••"
                                value={kod}
                                onChange={(e) => setKod(e.target.value.replace(/\D/g, ''))}
                                maxLength={4}
                                inputMode="numeric"
                                required
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Kontrol Ediliyor...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Doğrula</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <svg className={`w-5 h-5 ${sec > 30 ? 'text-green-500' : 'text-orange-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-600 font-medium">{sec}s</span>
                            </div>
                            <button
                                onClick={resend}
                                disabled={!canResend || loading}
                                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                type="button"
                            >
                                Tekrar Gönder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}