import { PaymentMethod } from '../types';

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-corp-visa',
    type: 'credit_card',
    name: 'Corporate Platinum Visa',
    last4: '4288',
    brand: 'Visa',
    expiryDate: '12/28',
    isDefault: true,
  },
  {
    id: 'pm-virtual-sub',
    type: 'virtual_card',
    name: 'SaaS Virtual Privacy Card',
    last4: '9901',
    brand: 'Mastercard',
    expiryDate: '08/27',
    isDefault: false,
  },
  {
    id: 'pm-biz-checking',
    type: 'bank_account',
    name: 'Silicon Valley Business Checking',
    last4: '1092',
    brand: 'ACH',
    isDefault: false,
  },
];
