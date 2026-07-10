import type { Metadata } from 'next';
import FranchiseRequestClient from './FranchiseRequestClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in';

export const metadata: Metadata = {
  title: 'IT Training & Consulting Franchise Opportunities | Techwell',
  description: 'Partner with Techwell and start your own highly profitable IT Training, Placement, and Consulting franchise. Proven business model and curriculum.',
  keywords: ['IT Training Franchise', 'Education Franchise', 'Business Consulting Franchise', 'Profitable Franchise', 'Techwell Partner'],
  alternates: {
    canonical: `${BASE_URL}/franchise-request`,
  }
};

export default function FranchiseRequestPage() {
  return <FranchiseRequestClient />;
}
