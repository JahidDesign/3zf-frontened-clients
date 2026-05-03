// ── Types ─────────────────────────────────────────────────────────────────────
export interface IVote {
  voter:     { _id: string; name: string; avatar?: string };
  decision:  'yes' | 'no';
  amount:    number;
  createdAt: string;
}

export interface IPayment {
  _id:           string;
  donor:         { _id: string; name: string; avatar?: string };
  amount:        number;
  method:        string;
  transactionId: string;
  status:        'pending' | 'verified' | 'rejected';
  createdAt:     string;
}

export type DonationStatus =
  | 'pending_review'
  | 'pending_vote'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface IDonation {
  _id:              string;
  title:            string;
  description:      string;
  category:         string;
  requestedAmount:  number;
  applicantName:    string;
  applicantPhone:   string;
  applicantAddress: string;
  media:            Array<{ url: string; type: 'image' | 'video' }>;
  author:           { _id: string; name: string; avatar?: string };
  status:           DonationStatus;
  adminNote?:       string;
  votes:            IVote[];
  votingDeadline?:  string;
  approvedAmount?:  number;
  votingResult?: {
    yesCount:     number;
    noCount:      number;
    totalPledged: number;
    approvedAt:   string;
  };
  payments:         IPayment[];
  raisedAmount:     number;
  completedAt?:     string;
  completionNote?:  string;
  completionDoc?:   Array<{ url: string }>;
  createdAt:        string;
}

export const STATUS_LABELS: Record<DonationStatus, string> = {
  pending_review: 'পর্যালোচনাধীন',
  pending_vote:   'ভোটিং চলছে',
  active:         'দান সক্রিয়',
  completed:      'সম্পন্ন',
  cancelled:      'বাতিল',
};

export const CATEGORY_LABELS: Record<string, string> = {
  medical:   '🏥 চিকিৎসা',
  education: '📚 শিক্ষা',
  disaster:  '🌊 দুর্যোগ',
  food:      '🍚 খাদ্য',
  other:     '🤝 অন্যান্য',
};