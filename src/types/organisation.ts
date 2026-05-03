// ─── Organisation Types ────────────────────────────────────────────────────────

export type MembershipStatus = 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'bank';

export interface OrgMembership {
  _id: string;
  user: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  division: string;
  occupation?: string;
  nidNumber: string;
  nidDocument?: { url: string; publicId: string };
  profilePhoto?: { url: string; publicId: string };
  membershipFee: number;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentStatus: 'pending' | 'paid';
  status: MembershipStatus;
  membershipId?: string;
  adminNote?: string;
  approvedBy?: string;
  approvedAt?: string;
  joinedAt: string;
  createdAt: string;
}

// ─── Donation Program Types ────────────────────────────────────────────────────

export type DonationProgramStatus =
  | 'pending_review'   // Admin যাচাই করছেন
  | 'pending_vote'     // সদস্যরা ভোট দিচ্ছেন
  | 'active'           // ডোনেশন সংগ্রহ চলছে
  | 'completed'        // লক্ষ্যমাত্রা পূর্ণ
  | 'cancelled';

export type DonationCategory =
  | 'medical' | 'food' | 'education' | 'clothes'
  | 'shelter' | 'disaster' | 'other';

export interface DonationProgram {
  _id: string;
  title: string;
  description: string;
  category: DonationCategory;
  status: DonationProgramStatus;
  requestedAmount: number;      // পোস্টদাতা চেয়েছেন
  approvedAmount?: number;      // ভোটে নির্ধারিত
  raisedAmount: number;         // এ পর্যন্ত সংগৃহীত
  requiredAmount: number;       // চূড়ান্ত লক্ষ্যমাত্রা
  media: Array<{ url: string; publicId: string; type: 'image' | 'video' }>;
  author: { _id: string; name: string; avatar?: string };
  location: { district?: string; division?: string; address?: string };
  contactPhone?: string;
  votes: {
    yes: number;
    no: number;
    totalProposedAmount: number;   // সকল হ্যাঁ ভোটারের প্রস্তাবিত টাকা
    myVote?: 'yes' | 'no';
    myProposedAmount?: number;
  };
  donors: Array<{
    user: string;
    name: string;
    amount: number;
    transactionId: string;
    method: PaymentMethod;
    status: 'verifying' | 'completed' | 'rejected';
    donatedAt: string;
  }>;
  documentaryUrl?: string;       // সম্পন্ন হলে ডকুমেন্টারি ভিডিও
  adminNote?: string;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// ─── Donation (individual contribution) ───────────────────────────────────────

export interface OrgDonation {
  _id: string;
  program: string;
  donor: { _id: string; name: string; email: string };
  donorName: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  screenshot?: { url: string; publicId: string };
  status: 'verifying' | 'completed' | 'rejected';
  adminNote?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

// ─── API Response wrappers ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}