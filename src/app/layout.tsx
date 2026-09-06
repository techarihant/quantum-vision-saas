import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'WhatsApp Marketing Automation & CRM SaaS',
  description: 'Production-ready Multi-tenant SaaS for WhatsApp Business Platform, Campaigns, CRM, Shared Inbox & Automations'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <AppProvider>
          <div className="flex h-full w-full overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
