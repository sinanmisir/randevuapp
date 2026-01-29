import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Randevu() {
    const nav = useNavigate();
    const { state } = useLocation();
    const ad = state?.ad || "";
    const soyad = state?.soyad || "";

    const [hizmetler, setHizmetler] = useState([]);
    const [hizmetId, setHizmetId] = useState("");
    const [tarih, setTarih] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [randevular, setRandevular] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [hizmetRes, randevuRes] = await Promise.all([
                    api.get("/api/hizmetler"),
                    api.get("/api/randevular")
                ]);
                setHizmetler(hizmetRes.data);
                setRandevular(randevuRes.data);
            } catch {
                nav("/", { replace: true });
            }
        };
        load();
    }, [nav]);

    const create = async (e) => {
        e.preventDefault();
        setErr("");
        setMsg("");
        setLoading(true);
        try {
            const dto = {
                hizmetId: Number(hizmetId),
                randevuTarih: new Date(tarih).toISOString(),
                ad,
                soyad,
            };
            const res = await api.post("/api/randevular", dto);
            setMsg("Randevunuz oluşturuldu, randevu bilgileriniz SMS olarak tarafınıza gönderildi.");
            // Randevu listesini yenile
            const randevuRes = await api.get("/api/randevular");
            setRandevular(randevuRes.data);
            setHizmetId("");
            setTarih("");
        } catch (ex) {
            setErr(ex?.response?.data?.message || "Randevu oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        nav("/");
    };

    // Token'dan telefon numarasını al
    const getUserPhone = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.phone;
        } catch {
            return null;
        }
    };

    const userPhone = getUserPhone();

    // Seçili hizmet için dolu saatleri filtrele
    const doluSaatler = hizmetId
        ? randevular
            .filter((r) => r.randevuHizmetId === Number(hizmetId))
            .map((r) => new Date(r.randevuTarih).toLocaleString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }))
        : [];

    // Kullanıcının kendi randevuları
    const benimRandevularim = userPhone
        ? randevular.filter((r) => r.telefon === userPhone)
        : [];

    return (
        <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-6xl mx-auto py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Randevu Sistemi
                        </h1>
                        <p className="text-gray-600 mt-1 ml-0 sm:ml-11">Hoş geldiniz, {ad} {soyad}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Çıkış</span>
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Sol Kolon - Form */}
                    <div className="space-y-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Yeni Randevu</h2>
                                    <p className="text-sm text-gray-600">Hizmet ve tarih seçin</p>
                                </div>
                            </div>

                            {err && (
                                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                    <p className="text-sm text-red-700 flex items-center">
                                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {err}
                                    </p>
                                </div>
                            )}
                            {msg && (
                                <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                                    <p className="text-sm text-green-700 flex items-center">
                                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {msg}
                                    </p>
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={create}>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Hizmet
                                    </label>
                                    <select
                                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none bg-white"
                                        value={hizmetId}
                                        onChange={(e) => setHizmetId(e.target.value)}
                                        required
                                    >
                                        <option value="">Hizmet seçin</option>
                                        {hizmetler.map((h) => (
                                            <option key={h.hizmetId} value={h.hizmetId}>
                                                {h.hizmetAdi}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Tarih ve Saat
                                    </label>
                                    <input
                                        className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                        type="datetime-local"
                                        value={tarih}
                                        onChange={(e) => setTarih(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
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
                                            <span>Oluşturuluyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Randevu Oluştur</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {hizmetId && doluSaatler.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Dolu Saatler</h3>
                                        <p className="text-xs text-gray-600">Bu saatler müsait değil</p>
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {doluSaatler.map((saat, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium text-sm">{saat}</span>
                                            </div>
                                            <span className="text-xs bg-red-100 px-2 py-1 rounded-lg font-semibold">Dolu</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sağ Kolon - Randevularım */}
                    <div>
                        {benimRandevularim.length > 0 ? (
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Randevularım</h3>
                                        <p className="text-xs text-gray-600">{benimRandevularim.length} aktif randevu</p>
                                    </div>
                                </div>
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {benimRandevularim.map((r) => (
                                        <div
                                            key={r.randevuId}
                                            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-5 hover:shadow-lg transition-shadow"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-800 text-base sm:text-lg mb-2 truncate">{r.hizmetAdi}</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center text-gray-700">
                                                            <svg className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="font-medium">
                                                                {new Date(r.randevuTarih).toLocaleString("tr-TR", {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <svg className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            <span className="truncate">{r.randevuAdi} {r.randevuSoyadi}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                        Aktif
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Henüz randevunuz yok</h3>
                                <p className="text-sm text-gray-600">Soldaki formu kullanarak yeni randevu oluşturabilirsiniz</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}