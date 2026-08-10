export interface Loan {
  id: string;
  bankName: string;
  bankLogo?: string;
  title: string;
  matchPercentage: number;
  matchType: 'High Match' | 'Partial Match' | 'Farm Match' | 'Live Match';
  amount: number;
  interestRate: number;
  tenureMonths: number;
  tags: string[];
  isBookmarked: boolean;
}

export const mockLoans: Loan[] = [
  {
    id: '1',
    bankName: 'Commercial Bank of Ethiopia',
    bankLogo: '/logos/cbe.png',
    title: 'Agricultural Loan',
    matchPercentage: 85,
    matchType: 'High Match',
    amount: 200000,
    interestRate: 11,
    tenureMonths: 2,
    tags: ['Input loan (seeds, agrochemicals)'],
    isBookmarked: false,
  },
  {
    id: '2',
    bankName: 'Awash Bank',
    bankLogo: '/logos/awash.png',
    title: 'Seasonal Loan',
    matchPercentage: 85,
    matchType: 'High Match',
    amount: 36000,
    interestRate: 7.2,
    tenureMonths: 3,
    tags: ['Agricultural term loan'],
    isBookmarked: false,
  },
  {
    id: '3',
    bankName: 'Bank of Abyssinia',
    bankLogo: '/logos/abyssinia.jpg',
    title: 'Farm Startup',
    matchPercentage: 78,
    matchType: 'Farm Match',
    amount: 350000,
    interestRate: 9,
    tenureMonths: 3,
    tags: ['Smallholder short-term loan'],
    isBookmarked: false,
  },
  {
    id: '4',
    bankName: 'Cooperative Bank of Oromia',
    bankLogo: '/logos/cbo.png',
    title: 'Input Loan',
    matchPercentage: 80,
    matchType: 'Partial Match',
    amount: 50000,
    interestRate: 11,
    tenureMonths: 1,
    tags: ['Land loan'],
    isBookmarked: false,
  },
  {
    id: '5',
    bankName: 'Zemen Bank',
    bankLogo: '/logos/zemen.png',
    title: 'Agricultural Loan',
    matchPercentage: 77,
    matchType: 'Partial Match',
    amount: 120000,
    interestRate: 10.5,
    tenureMonths: 2,
    tags: ['Farm equipment loan'],
    isBookmarked: false,
  },
  {
    id: '6',
    bankName: 'Abay Bank',
    bankLogo: '/logos/abay.png',
    title: 'Seed Loan',
    matchPercentage: 82,
    matchType: 'High Match',
    amount: 40000,
    interestRate: 6.8,
    tenureMonths: 2,
    tags: ['Smallholder farmer direct loan'],
    isBookmarked: false,
  },
  {
    id: '7',
    bankName: 'Tsedey Bank',
    bankLogo: '/logos/tsedey.jpg',
    title: 'Seasonal MicroFinance',
    matchPercentage: 60,
    matchType: 'Partial Match',
    amount: 25000,
    interestRate: 12,
    tenureMonths: 1,
    tags: ['Input loan (seeds, agrochemicals)'],
    isBookmarked: false,
  },
  {
    id: '8',
    bankName: 'Bunna International Bank',
    bankLogo: '/logos/bib.png',
    title: 'Equipment Loan',
    matchPercentage: 5,
    matchType: 'Live Match',
    amount: 500000,
    interestRate: 9,
    tenureMonths: 4,
    tags: ['Agricultural term loan'],
    isBookmarked: false,
  },
];
