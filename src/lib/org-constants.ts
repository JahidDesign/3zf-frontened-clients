import { DonationCategory, DonationProgramStatus, PaymentMethod } from '@/types/organisation';

export const CATEGORY_LABELS: Record<DonationCategory, string> = {
  medical:   'চিকিৎসা',
  food:      'খাদ্য',
  education: 'শিক্ষা',
  clothes:   'পোশাক',
  shelter:   'আশ্রয়',
  disaster:  'দুর্যোগ',
  other:     'অন্যান্য',
};

export const CATEGORY_ICONS: Record<DonationCategory, string> = {
  medical:   '',
  food:      '',
  education: '',
  clothes:   '',
  shelter:   '',
  disaster:  '',
  other:     '',
};

export const STATUS_LABELS: Record<DonationProgramStatus, string> = {
  pending_review: 'পর্যালোচনায়',
  pending_vote:   'ভোটিং চলছে',
  active:         'সক্রিয়',
  completed:      'সম্পন্ন',
  cancelled:      'বাতিল',
};

export const STATUS_COLORS: Record<DonationProgramStatus, string> = {
  pending_review: 'bg-amber-50 text-amber-800 border-amber-200',
  pending_vote:   'bg-purple-50 text-purple-800 border-purple-200',
  active:         'bg-green-50 text-green-800 border-green-200',
  completed:      'bg-blue-50 text-blue-800 border-blue-200',
  cancelled:      'bg-red-50 text-red-800 border-red-200',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  bkash:  'বিকাশ',
  nagad:  'নগদ',
  rocket: 'রকেট',
  bank:   'ব্যাংক ট্রান্সফার',
};

export const MEMBERSHIP_FEE = 200;

export const DISTRICTS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল',
  'সিলেট', 'রংপুর', 'ময়মনসিংহ', 'কুমিল্লা', 'গাজীপুর',
  'নারায়ণগঞ্জ', 'টাঙ্গাইল', 'ফরিদপুর', 'বগুড়া', 'দিনাজপুর',
];

export const DIVISIONS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা',
  'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ',
];

export const ALL_CATEGORIES: DonationCategory[] = [
  'medical', 'food', 'education', 'clothes', 'shelter', 'disaster', 'other',
];