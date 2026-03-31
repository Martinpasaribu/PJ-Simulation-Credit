export interface IUser {
  _id?: string;
  name: string;
}

export interface IProduct {
  _id?: string;
  name: string;
  otr: number;
}

export interface ITransaction {
    _id?: string;
    contractId?: string;
  userId: string | IUser;
  productId: string | IProduct;
  tenure: number;
  dp: number;
  totalLoan: number;
  monthlyPayment: number;
  interestRate: number;
  createdAt?: string;
}