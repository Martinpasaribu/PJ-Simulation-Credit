import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({ name: { type: String, required: true } });
const ProductSchema = new Schema({ name: String, otr: Number });

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  contractId: { type: String, unique: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  tenure: Number,
  dp: Number,
  totalLoan: Number,
  monthlyPayment: Number,
  interestRate: Number,
  startDate: Date,
  
  // TAMBAHKAN FIELD INI:
  // Array of ObjectIds yang merujuk ke model 'Installment'
  installments: [{ type: Schema.Types.ObjectId, ref: 'Installment' }] 
  
}, { timestamps: true });

const InstallmentSchema = new Schema({
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  contractId: String,
  month: Number,
  amount: Number,
  dueDate: Date,
  status: { 
    type: String, 
    enum: ['PENDING', 'PAID'], 
    default: 'PENDING' 
  },
  paidAt: Date 
});

// Tambahkan di models/Schema.ts

const GlobalConfigSchema = new Schema({
  // Aturan Bunga
  interestRates: [{
    label: String,    // Contoh: "Tenor Pendek"
    minTenure: Number, // 1
    maxTenure: Number, // 12
    rate: Number      // 0.12 (12%)
  }],
  // Aturan Denda
  penaltyRate: { type: Number, default: 0.001 }, // 0.1% per hari
  penaltyGracePeriod: { type: Number, default: 0 }, // Masa tenggang (hari)
  updatedAt: { type: Date, default: Date.now }
});

export const GlobalConfig = models.GlobalConfig || model('GlobalConfig', GlobalConfigSchema);

export const User = models.User || model('User', UserSchema);
export const Product = models.Product || model('Product', ProductSchema);
export const Transaction = models.Transaction || model('Transaction', TransactionSchema);
export const Installment = models.Installment || model('Installment', InstallmentSchema);