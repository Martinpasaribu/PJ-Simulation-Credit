"use client";
import { useState, useEffect, use, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// --- IMPORT DRIVER.JS ---
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function SimulationPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const id = resolvedParams.id;

  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const [data, setData] = useState<any>(null);
  const [globalDate, setGlobalDate] = useState(initialDate);
  const [loading, setLoading] = useState(true);

  // --- LOGIKA TUTORIAL SIMULASI ---
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          element: '#tour-contract-header',
          popover: {
            title: 'Informasi Kontrak',
            description: 'Di sini kamu bisa melihat ID Kontrak, nama nasabah, dan ringkasan unit kendaraan yang diambil.',
            side: "bottom",
          }
        },
        {
          element: '#tour-sim-date',
          popover: {
            title: 'Mesin Simulasi',
            description: 'Ganti tanggal di sini untuk mensimulasikan waktu. Jika tanggal melewati jatuh tempo, denda akan otomatis terhitung di tabel bawah.',
            side: "left",
          }
        },
        {
          element: '#tour-stats',
          popover: {
            title: 'Ringkasan Tagihan',
            description: 'Pantau akumulasi denda, sisa pokok, dan jumlah bulan yang sudah jatuh tempo secara instan.',
            side: "top",
          }
        },
        {
          element: '#tour-table',
          popover: {
            title: 'Jadwal Angsuran',
            description: 'Klik tombol BAYAR untuk melunasi angsuran. Status akan berubah menjadi LUNAS dan denda akan berhenti bertambah.',
            side: "top",
          }
        }
      ]
    });
    driverObj.drive();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id || id === "undefined") return;
        const res = await fetch(`/api/simulation/${id}`);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const json = await res.json();
        setData(json);

        // Jalankan tour jika data sudah ada dan user baru pertama kali masuk ke simulasi
        if (!localStorage.getItem('ims_sim_tour_done')) {
            setTimeout(startTour, 1000);
            localStorage.setItem('ims_sim_tour_done', 'true');
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // (Logika getPenaltyDetail, stats, handlePay, formatIDR tetap sama seperti kode anda)
  const getPenaltyDetail = (dueDate: string, amount: number, status: string) => {
    if (status === 'PAID') return { penalty: 0, daysLate: 0 };
    const dDue = new Date(dueDate);
    dDue.setHours(0, 0, 0, 0);
    const dSim = new Date(globalDate);
    dSim.setHours(0, 0, 0, 0);
    if (dSim <= dDue) return { penalty: 0, daysLate: 0 };
    const diffTime = dSim.getTime() - dDue.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return {
      penalty: Math.round((amount * 0.001) * diffDays),
      daysLate: diffDays
    };
  };

  const stats = useMemo(() => {
    if (!data?.installments) return { totalPenalty: 0, totalPrincipalUnpaid: 0, totalDueCount: 0, remainingTenure: 0 };
    let penaltyAcc = 0; let unpaidAcc = 0; let dueCount = 0; let pendingCount = 0;
    const dSim = new Date(globalDate);
    dSim.setHours(0, 0, 0, 0);
    data.installments.forEach((inst: any) => {
      const { penalty } = getPenaltyDetail(inst.dueDate, inst.amount, inst.status);
      penaltyAcc += penalty;
      if (inst.status === 'PENDING') {
        unpaidAcc += inst.amount;
        pendingCount++;
        const dDue = new Date(inst.dueDate);
        dDue.setHours(0, 0, 0, 0);
        if (dSim >= dDue) dueCount++;
      }
    });
    return { totalPenalty: penaltyAcc, totalPrincipalUnpaid: unpaidAcc, totalDueCount: dueCount, remainingTenure: pendingCount };
  }, [data, globalDate]);

  const handlePay = async (instId: string) => {
    if (!confirm("Bayar angsuran ini?")) return;
    const res = await fetch(`/api/simulation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ installmentId: instId })
    });
    if (res.ok) {
        const resData = await fetch(`/api/simulation/${id}`);
        const json = await resData.json();
        setData(json);
    }
  };

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0 
  }).format(val);

  if (loading) return <div className="p-20 text-center text-blue-500 font-mono animate-pulse">Loading Simulation...</div>;
  if (!data?.transaction) return <div className="p-20 text-center text-red-400 font-mono">Data tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button onClick={() => router.back()} className="text-slate-500 hover:text-white flex items-center gap-2 transition-all text-sm">
                ← Kembali <span className="hidden md:inline">ke Dashboard</span>
            </button>
            <button onClick={startTour} className="text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 font-bold hover:bg-blue-500 hover:text-white transition-all">
                BANTUAN?
            </button>
        </div>

        {/* HEADER INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          <div id="tour-contract-header" className="lg:col-span-2 bg-[#0f172a] p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-4">
               <div>
                  <h1 className="text-2xl md:text-4xl font-black text-blue-500 mb-2">{data.transaction.contractId}</h1>
                  <p className="text-slate-400 text-sm md:font-medium">Customer: <span className="text-white">{data.transaction.userId?.name}</span></p>
               </div>
               <div className="text-left sm:text-right bg-slate-800/30 p-3 rounded-2xl border border-slate-700/50 w-full sm:w-auto">
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Sisa Tenor</p>
                    <p className="text-xl md:text-2xl font-black text-blue-400">{stats.remainingTenure} <span className="text-xs text-slate-500">/ {data.transaction.tenure} Bln</span></p>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/50">
                <div>
                    <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">Unit</p>
                    <p className="text-white text-sm md:text-base font-medium truncate">{data.transaction.productId?.name}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">OTR</p>
                    <p className="text-white text-sm md:text-base font-medium">{formatIDR(data.transaction.productId?.otr || 0)}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">DP</p>
                    <p className="text-white text-sm md:text-base font-medium">{formatIDR(data.transaction.dp)}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">Bunga</p>
                    <p className="text-base md:text-lg font-black text-orange-400">{data.transaction.interestRate} %</p>
                </div>
            </div>
          </div>

          <div id="tour-sim-date" className="bg-blue-600/10 border border-blue-500/30 p-6 md:p-8 rounded-3xl flex flex-col justify-center">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-3 text-center">Tanggal Simulasi</label>
             <input 
                type="date" 
                value={globalDate}
                onChange={(e) => setGlobalDate(e.target.value)}
                className="bg-[#1e293b] text-center text-xl md:text-2xl font-mono text-blue-400 p-3 rounded-2xl border border-blue-500/20 focus:outline-none w-full"
             />
          </div>
        </div>

        {/* STATS CARDS */}
        <div id="tour-stats" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="bg-[#0f172a] p-5 md:p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-2">Angsuran Jatuh Tempo</p>
                <div className="flex items-end gap-2">
                    <p className="text-2xl md:text-3xl font-black text-orange-400">{stats.totalDueCount}</p>
                    <p className="text-slate-500 text-xs mb-1 pb-1">Bulan</p>
                </div>
            </div>
            <div className="bg-[#0f172a] p-5 md:p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-2">Sisa Tagihan Pokok</p>
                <p className="text-2xl md:text-3xl font-black">{formatIDR(stats.totalPrincipalUnpaid)}</p>
            </div>
            <div className={`p-5 md:p-6 rounded-2xl border transition-all sm:col-span-2 md:col-span-1 ${stats.totalPenalty > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                <p className={`${stats.totalPenalty > 0 ? 'text-red-400' : 'text-green-400'} text-[10px] md:text-xs font-bold uppercase mb-2`}>Total Akumulasi Denda</p>
                <p className={`text-2xl md:text-3xl font-black ${stats.totalPenalty > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatIDR(stats.totalPenalty)}</p>
            </div>
        </div>

        {/* TABLE JADWAL */}
        <div id="tour-table" className="bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px] md:min-w-full">
                {/* ... (isi table anda tetap sama) ... */}
                <thead>
                <tr className="bg-slate-800/50 text-[10px] font-black uppercase text-slate-500">
                    <th className="p-4 md:p-6">No Kontrak</th>
                    <th className="p-4 md:p-6">Customer</th>
                    <th className="p-4 md:p-6">Bln</th>
                    <th className="p-4 md:p-6">Jatuh Tempo</th>
                    <th className="p-4 md:p-6">Angsuran</th>
                    <th className="p-4 md:p-6 text-orange-400">Telat</th>
                    <th className="p-4 md:p-6 text-red-400">Denda</th>
                    <th className="p-4 md:p-6 text-center">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                {data.installments.map((inst: any) => {
                    const { penalty, daysLate } = getPenaltyDetail(inst.dueDate, inst.amount, inst.status);
                    const isLate = penalty > 0;
                    return (
                    <tr key={inst._id} className={`transition-colors ${inst.status === 'PAID' ? 'bg-slate-900/40' : 'hover:bg-blue-500/[0.02]'}`}>
                        <td className="p-4 md:p-6 font-mono font-bold text-blue-400 text-xs md:text-sm">{inst.contractId}</td>
                        <td className="p-4 md:p-6 font-mono font-bold text-blue-400 text-xs md:text-sm">{inst.userId?.name}</td>
                        <td className="p-4 md:p-6 font-mono font-bold text-blue-400 text-xs md:text-sm">{inst.month}</td>
                        <td className="p-4 md:p-6 text-xs md:text-sm text-slate-400 whitespace-nowrap">
                            {new Date(inst.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="p-4 md:p-6 font-bold text-sm md:text-base whitespace-nowrap">{formatIDR(inst.amount)}</td>
                        <td className="p-4 md:p-6 font-mono text-xs md:text-sm">
                            {daysLate > 0 ? (
                                <span className="text-orange-400 font-bold">{daysLate} Hari</span>
                            ) : (
                                <span className="text-slate-600">-</span>
                            )}
                        </td>
                        <td className={`p-4 md:p-6 font-bold text-sm md:text-base ${isLate ? 'text-red-500' : 'text-slate-600 font-normal'}`}>
                        {formatIDR(penalty)}
                        </td>
                        <td className="p-4 md:p-6 text-center">
                        {inst.status === 'PAID' ? (
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black bg-green-500/20 text-green-500 px-3 py-1 rounded-full border border-green-500/30">LUNAS</span>
                            </div>
                        ) : (
                            <button 
                            onClick={() => handlePay(inst._id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-4 md:px-5 py-2 rounded-xl transition-all shadow-lg active:scale-95"
                            >
                            BAYAR
                            </button>
                        )}
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}