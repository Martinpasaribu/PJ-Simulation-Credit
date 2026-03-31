"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ITransaction } from '@/types';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";


export default function IMSDashboard() {
  const router = useRouter();
  const [history, setHistory] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<any>(null);
    const [simDate, setSimDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-25`;
    });

  const [form, setForm] = useState({
    name: '',
    carName: '',
    otr: 0,
    tenure: 12,
    dp: 0
  });

  // --- FUNGSI TUTORIAL ---
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        { 
          element: '#tour-welcome', 
          popover: { title: 'Selamat Datang!', description: 'Ini adalah Dashboard PT IMS Finance untuk simulasi kredit.', side: "bottom" } 
        },
        { 
          element: '#tour-date', 
          popover: { title: 'Global Date', description: 'Atur tanggal hari ini untuk melihat simulasi denda di masa depan.', side: "bottom" } 
        },
        { 
          element: '#tour-form', 
          popover: { title: 'Input Data', description: 'Isi data kendaraan dan tenor di sini untuk membuat kontrak baru.', side: "right" } 
        },
        { 
          element: '#tour-history', 
          popover: { title: 'Daftar Kontrak', description: 'Semua kontrak akan muncul di sini. Klik barisnya untuk detail pembayaran.', side: "top" } 
        },
        { 
          element: '#tour-settings', 
          popover: { title: 'Konfigurasi', description: 'Atur bunga dan denda harian di sini.', side: "left" } 
        },
      ]
    });
    driverObj.drive();
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/simulation');
      const data = await res.json();
      setHistory(data);

      const resConfig = await fetch('/api/settings/config');
      const configData = await resConfig.json();
      setConfig(configData);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };


  useEffect(() => { 
    fetchHistory(); 
    // Jalankan tour otomatis jika belum pernah melihat
    if (!localStorage.getItem('ims_tour_done')) {
      setTimeout(startTour, 1000);
      localStorage.setItem('ims_tour_done', 'true');
    }
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const res = await fetch(`/api/simulation?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item._id !== id));
      } else {
        alert("Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, startDate: simDate })
      });
      
      if (res.ok) {
        alert("Data PT IMS Berhasil Disimpan");
        setForm({ name: '', carName: '', otr: 0, tenure: 12, dp: 0 }); 
        fetchHistory();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id: string | undefined) => {
    if (!id) {
      alert("Terjadi kesalahan: ID tidak valid.");
      return;
    }
    router.push(`/simulation/${id}?date=${simDate}`);
  };

  const formatIDR = (val: number) => 
    new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(val);

  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (res.ok) {
        alert("Konfigurasi berhasil diperbarui!");
        setShowSettings(false);
        fetchHistory();
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: Responsive Column to Row */}
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-blue-500 pl-4">
          <div id="tour-welcome">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
              PT IMS <span className="text-blue-500">FINANCE</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm italic">Sistem Simulasi Angsuran & Penalti Kendaraan</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              id="tour-settings"
              onClick={() => setShowSettings(true)}
              className="bg-[#0f172a] border border-slate-700 p-3 md:p-4 rounded-2xl hover:border-blue-500 transition-all text-slate-400 hover:text-blue-400 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <div 
                id="tour-date"
                className="flex-1 bg-[#0f172a] border border-blue-500/30 p-3 md:p-4 rounded-2xl flex items-center justify-between gap-4 shadow-lg shadow-blue-500/5">
              <div className="hidden sm:block">
                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest text-right">System Date</p>
                <p className="text-[8px] text-slate-500 text-right italic">Simulation time</p>
              </div>
              <input 
                type="date" 
                value={simDate}
                onChange={(e) => setSimDate(e.target.value)}
                className="bg-[#1e293b] border border-slate-700 text-blue-400 text-xs md:text-sm font-mono p-2 rounded-lg outline-none w-full md:w-auto"
              />
            </div>

            <button onClick={startTour} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 font-bold">HELP?</button>
          </div>
        </header>

        {/* MAIN CONTENT: Stack on Mobile, Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* FORM: Col 3 Desktop, Full Mobile */}
          <div 
            id="tour-form"
            className="lg:col-span-4 xl:col-span-3 bg-[#0f172a] p-5 md:p-6 rounded-2xl border border-slate-800 shadow-2xl h-fit order-2 lg:order-1">
            <h2 className="text-md md:text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Input Data Baru
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Nama Lengkap</label>
                <input required type="text" value={form.name} className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-sm"
                  onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Nama Unit Kendaraan</label>
                <input required type="text" value={form.carName} className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-sm"
                  onChange={e => setForm({...form, carName: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Harga OTR</label>
                  <input required type="number" value={form.otr || ''} className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl outline-none text-sm"
                    onChange={e => setForm({...form, otr: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">DP (Awal)</label>
                  <input required type="number" value={form.dp || ''} className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl outline-none text-sm"
                    onChange={e => setForm({...form, dp: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Tenor (Bulan)</label>
                <div className="relative">
                  <input required type="number" min="1" max="36" value={form.tenure}
                    className="w-full bg-[#1e293b] border border-slate-700 p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-sm"
                    onChange={e => setForm({...form, tenure: Number(e.target.value)})} />
                  <span className="absolute right-4 top-3 text-slate-500 text-sm italic">Bln</span>
                </div>
              </div>

              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all mt-4 active:scale-[0.98]">
                {loading ? 'Memproses...' : 'Daftarkan & Kalkulasi'}
              </button>
            </form>
          </div>

          {/* TABLE: Col 9 Desktop, Full Mobile */}
          <div 
            id="tour-history"
            className="lg:col-span-8 xl:col-span-9 bg-[#0f172a] rounded-2xl border border-slate-800 shadow-xl flex flex-col order-1 lg:order-2">
             <div className="p-5 md:p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-md md:text-lg font-bold">Riwayat Transaksi</h2>
                    <p className="text-[9px] md:text-[10px] text-slate-500">Klik baris untuk simulasi angsuran</p>
                </div>
                <span className="hidden sm:inline-block text-[10px] bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">System Active</span>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px] md:min-w-full">
                  <thead className="bg-[#1e293b]/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="p-4 md:p-5">Customer & Unit</th>
                      <th className="p-4 md:p-5">Financial</th>
                      <th className="p-4 md:p-5 text-center">Tenor</th>
                      <th className="p-4 md:p-5 text-right">Angsuran</th>
                      <th className="p-4 md:p-5 text-right text-orange-400">Sisa Tagihan</th>
                      <th className="p-4 md:p-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-slate-500 italic text-sm">Belum ada data</td>
                      </tr>
                    ) : (
                      history.map((item: any) => {
                        const unpaid = item.installments?.filter((i: any) => i.status === 'PENDING') || [];
                        const remainingTenure = unpaid.length;
                        const totalRemainingBill = unpaid.reduce((acc: number, curr: any) => acc + curr.amount, 0);

                        return (
                          <tr 
                            key={item._id} 
                            onClick={() => handleRowClick(item._id as string)}
                            className="hover:bg-blue-500/[0.05] cursor-grab transition-all group"
                          >
                            <td className="p-4 md:p-5">
                              <p className="font-bold text-sm md:text-base text-slate-200 capitalize">{(item.userId as any)?.name}</p>
                              <p className="text-[10px] text-slate-500 italic">{(item.productId as any)?.name}</p>
                            </td>
                            <td className="p-4 md:p-5 text-[11px] md:text-xs">
                              <p className="text-slate-400 whitespace-nowrap">OTR: <span className="text-white">{formatIDR(item.productId?.otr || 0)}</span></p>
                              <p className="text-slate-400 whitespace-nowrap">DP: <span className="text-blue-400">{formatIDR(item.dp)}</span></p>
                            </td>
                            <td className="p-4 md:p-5 text-center">
                              <div className="inline-block px-2 py-1 bg-slate-800 rounded-lg text-[10px] md:text-xs font-bold">
                                  <span className="text-white">{remainingTenure}</span>
                                  <span className="text-slate-500 ml-1">/ {item.tenure}</span>
                              </div>
                            </td>
                            <td className="p-4 md:p-5 text-right">
                              <div className="font-mono font-bold text-green-400 text-xs md:text-sm">{formatIDR(item.monthlyPayment)}</div>
                              <div className="text-[8px] md:text-[9px] text-yellow-500/70 italic font-bold">Bunga {item.interestRate}%</div>
                            </td>
                            <td className="p-4 md:p-5 text-right font-mono font-bold text-orange-400 bg-orange-500/5 text-xs md:text-sm">
                              {formatIDR(totalRemainingBill)}
                            </td>
                            <td className="p-4 md:p-5 text-center">
                              <button 
                                onClick={(e) => handleDelete(item._id as string, e)}
                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>

      {/* MODAL SETTINGS: Enhanced for Mobile */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-widest">Global Settings</h3>
                  <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white transition-colors p-2">✕</button>
              </div>
              
              <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Denda Harian (%)</label>
                    <div className="flex gap-2 mt-2">
                        <input 
                          type="number" 
                          step="0.01" 
                          value={(config?.penaltyRate * 100).toFixed(2)} 
                          onChange={(e) => setConfig({...config, penaltyRate: Number(e.target.value) / 100})}
                          className="bg-[#1e293b] border border-slate-700 p-3 rounded-xl w-full outline-none focus:border-orange-500 text-white font-mono" 
                        />
                        <div className="bg-orange-500/10 text-orange-500 px-4 flex items-center rounded-xl font-bold font-mono">%</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Konfigurasi Bunga</label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {config?.interestRates?.map((r: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-[#1e293b] p-3 rounded-xl border border-slate-700">
                            <span className="text-[10px] md:text-xs text-slate-400 font-mono">{r.minTenure}-{r.maxTenure} Bln</span>
                            <div className="flex items-center gap-2">
                              <input 
                                  type="number"
                                  value={r.rate * 100}
                                  onChange={(e) => {
                                  const newRates = [...config.interestRates];
                                  newRates[idx].rate = Number(e.target.value) / 100;
                                  setConfig({...config, interestRates: newRates});
                                  }}
                                  className="w-20 bg-transparent text-right text-blue-400 font-bold font-mono outline-none"
                              />
                              <span className="text-blue-400 font-bold">%</span>
                            </div>
                        </div>
                        ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdateConfig}
                    disabled={loading}
                    className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-slate-200 transition-all disabled:bg-slate-500"
                  >
                    {loading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                  </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}