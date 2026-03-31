import { GlobalConfig } from "@/models/Schema";
import { NextResponse } from "next/server";
import dbConnect from '@/lib/mongodb';

// GET: Mengambil konfigurasi bunga dan denda
export async function GET() {
  try {
    await dbConnect();
    
    // Mencari config pertama (atau buat default jika belum ada)
    let config = await GlobalConfig.findOne();
    
    if (!config) {
      config = await GlobalConfig.create({
        penaltyRate: 0.001, // Default 0.1% per hari
        interestRates: [
          { minTenure: 1, maxTenure: 12, rate: 0.12 },
          { minTenure: 13, maxTenure: 24, rate: 0.14 },
          { minTenure: 25, maxTenure: 36, rate: 0.15 }
        ]
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Memperbarui nilai konfigurasi
export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const updatedConfig = await GlobalConfig.findOneAndUpdate(
      {}, // Ambil dokumen pertama
      { $set: body },
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedConfig);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}