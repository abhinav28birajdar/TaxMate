import { redirect } from 'next/navigation';

export const metadata = {
  title: "Client Portal - TaxMate",
  description: "Manage your tax filings, documents, and communicate with your CA.",
};

export default function ClientPortalPage() {
  // This legacy root used static financial figures and inert controls. Keep
  // bookmarked links working while routing everyone to the live dashboard.
  redirect('/portal/dashboard');
}
