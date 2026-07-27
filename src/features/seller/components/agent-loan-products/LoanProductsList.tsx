import { BankHeaderCard } from './BankHeaderCard';
import { LoanProduct, LoanProductCard } from './LoanProductCard';

const mockLoanProducts: LoanProduct[] = [
  {
    id: '1',
    title: 'CBE Smallholder Seed Loan',
    category: 'seed',
    status: 'Active',
    amount: 'ETB 5,000–25,000',
    interestValue: '8.5%',
    interestLabel: 'p.a.',
    tenureValue: '12m',
    tenureLabel: 'tenure',
    applicantsValue: 142,
    applicantsLabel: 'applicants'
  },
  {
    id: '2',
    title: 'CBE Agri Input Finance',
    category: 'input',
    status: 'Active',
    amount: 'ETB 10,000–50,000',
    interestValue: '9.2%',
    interestLabel: 'p.a.',
    tenureValue: '18m',
    tenureLabel: 'tenure',
    applicantsValue: 89,
    applicantsLabel: 'applicants'
  },
  {
    id: '3',
    title: 'CBE Pastoralist Livestock Loan',
    category: 'livestock',
    status: 'Active',
    amount: 'ETB 20,000–150,000',
    interestValue: '9%',
    interestLabel: 'p.a.',
    tenureValue: '24m',
    tenureLabel: 'tenure',
    applicantsValue: 67,
    applicantsLabel: 'applicants'
  },
  {
    id: '4',
    title: 'CBE Equipment & Irrigation Loan',
    category: 'equipment',
    status: 'Pending Approved',
    amount: 'ETB 50,000–500,000',
    interestValue: '10.5%',
    interestLabel: 'p.a.',
    tenureValue: '36m',
    tenureLabel: 'tenure',
    applicantsValue: 21,
    applicantsLabel: 'applicants'
  }
];

export const LoanProductsList = () => {
  return (
    <div className="w-full  mx-auto space-y-4">
      <BankHeaderCard />

      <div className="flex flex-col gap-4 mt-6">
        {mockLoanProducts.map((product) => (
          <LoanProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
