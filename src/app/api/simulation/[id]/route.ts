import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Transaction, Installment } from '@/models/Schema';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await dbConnect();
    
    // Unwrapping params jika berupa Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Validasi apakah ID adalah format MongoDB yang benar
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID Transaksi tidak valid secara format" }, { status: 400 });
    }

    const transaction = await Transaction.findById(id).populate('userId productId');
    
    if (!transaction) {
      return NextResponse.json({ error: "Data transaksi tidak ditemukan di database" }, { status: 404 });
    }

    const installments = await Installment.find({ transactionId: id }).sort({ month: 1 }).populate('userId')

    return NextResponse.json({ transaction, installments });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { installmentId } = await req.json();

    const updated = await Installment.findByIdAndUpdate(
      installmentId,
      { status: 'PAID', paidAt: new Date() },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}