"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        
        {/* NAVBAR */}
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-black">IMS</span>
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase ">PT IMS <span className="text-blue-500">FINANCE</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Security</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
          </div>
        </nav>

        {/* HERO SECTION */}
        <main className="flex-1 flex flex-col items-center justify-center text-center gap-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">V2.0 Financial Engine Active</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
            Kelola Kredit Kendaraan <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent italic">
              Tanpa Selisih Rupiah.
            </span>
          </h1>

          <p className="max-w-2xl text-slate-500 text-lg leading-relaxed">
            Sistem simulasi angsuran pintar PT IMS dengan presisi tinggi. 
            Dilengkapi perhitungan denda harian otomatis dan manajemen tenor yang akurat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button 
              onClick={() => router.push('/simulation')}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 transition-all hover:-translate-y-1 active:scale-95 group"
            >
              MULAI SIMULASI 
              <span className="ml-2 group-hover:ml-4 transition-all">→</span>
            </button>
            <button className="px-10 py-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-2xl transition-all">
              PELAJARI SISTEM
            </button>
          </div>
        </main>

        {/* FEATURE HIGHLIGHTS */}
        <section className="grid md:grid-cols-3 gap-6 mt-20 pt-20 border-t border-slate-800/50">
          <div className="p-6">
            <div className="text-blue-500 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
               </svg>
            </div>
            <h3 className="font-bold mb-2">Zero-Gap Calculation</h3>
            <p className="text-sm text-slate-500">Logika penyesuaian otomatis pada bulan terakhir memastikan saldo akhir tepat Rp0.</p>
          </div>
          <div className="p-6">
            <div className="text-orange-500 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="font-bold mb-2">Real-time Penalty</h3>
            <p className="text-sm text-slate-500">Denda dihitung per hari berdasarkan tanggal simulasi global yang dapat diatur.</p>
          </div>
          <div className="p-6">
            <div className="text-green-500 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04 Pelajari more.." />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04" />
               </svg>
            </div>
            <h3 className="font-bold mb-2">Secure Management</h3>
            <p className="text-sm text-slate-500">Data customer dan history transaksi tersimpan aman dalam database terpusat.</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-20 py-8 text-center text-slate-600 text-[10px] uppercase tracking-widest font-bold">
          © 2026 PT IMS Financial Technology. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
}