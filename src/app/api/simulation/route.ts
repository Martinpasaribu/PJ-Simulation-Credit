import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Product, Transaction, Installment, GlobalConfig } from '@/models/Schema';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, carName, otr, tenure, dp, startDate } = await req.json();

    const baseDate = startDate ? new Date(startDate) : new Date();

    // 1. Ambil Konfigurasi Global dari Database
    const config = await GlobalConfig.findOne();
    
    // 2. Tentukan Bunga Berdasarkan Tenor (Cari dari array interestRates di DB)
    let rate = 0.15; // Default fallback jika tidak ada config
    if (config && config.interestRates) {
      const match = config.interestRates.find(
        (r: any) => tenure >= r.minTenure && tenure <= r.maxTenure
      );
      if (match) rate = match.rate;
    }

    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const contractYear = baseDate.getFullYear(); 
    const contractId = `IMS-${contractYear}-${randomStr}`;

    const principal = otr - dp;
    
    // Hitung TOTAL HUTANG menggunakan rate dari DB
    const totalToPay = principal + (principal * rate); 
    const monthlyPayment = Math.round(totalToPay / tenure);

    // 3. Simpan User & Product
    const user = await User.create({ name });
    const product = await Product.create({ name: carName, otr });
    
    // 4. Simpan Transaction Master (Menyimpan rate yang terpilih saat itu)
    const transaction = await Transaction.create({
      contractId,
      userId: user._id,
      productId: product._id,
      tenure,
      dp,
      
      totalLoan: principal,
      monthlyPayment,
      interestRate: Number((rate * 100).toFixed(1)),
      penaltyRate: config?.penaltyRate || 0.001, // Simpan denda yang berlaku saat kontrak dibuat
      startDate: baseDate 
    });

    // 5. Generate Data Angsuran dengan PENYESUAIAN SELISIH
    const installmentData = Array.from({ length: tenure }, (_, i) => {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + (i + 1));

      const isLastMonth = i === tenure - 1;
      const finalAmount = isLastMonth 
        ? totalToPay - (monthlyPayment * (tenure - 1))
        : monthlyPayment;

      return {
        transactionId: transaction._id,
        userId: user._id,
        contractId,
        month: i + 1,
        amount: finalAmount,
        dueDate: dueDate,
        status: 'PENDING'
      };
    });

    // 6. Insert Angsuran
    const createdInstallments = await Installment.insertMany(installmentData);

    // 7. Hubungkan ID Angsuran ke Transaksi
    await Transaction.findByIdAndUpdate(transaction._id, {
      $set: { installments: createdInstallments.map(ins => ins._id) }
    });

    return NextResponse.json({ success: true, contractId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function GET() {
  try {
    await dbConnect();
    const transactions = await Transaction.find({})
      .populate('userId')
      .populate('productId')
      .populate('installments') // <--- Ditambahkan agar data cicilan ikut terambil untuk hitung sisa tenor
      .sort({ createdAt: -1 });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    // Hapus transaksi dan angsuran terkait
    await Transaction.findByIdAndDelete(id);
    await Installment.deleteMany({ transactionId: id });

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Catatan: Jika ini route simulation/route.ts, PATCH biasanya butuh ID di body atau query 
// karena Next.js App Router mengelompokkan method berdasarkan path file.
export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { installmentId } = await req.json();

    const updated = await Installment.findByIdAndUpdate(
      installmentId,
      { status: 'PAID', paidAt: new Date() },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}