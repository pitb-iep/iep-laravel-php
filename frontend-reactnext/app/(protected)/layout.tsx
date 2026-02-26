import Sidebar from '@/components/Sidebar';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('app_token');

  if (!token) {
    redirect('/auth/login');
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[280px] print:ml-0 relative flex flex-col p-8 print:p-0">
        {/* Decorative Blob */}
        <div className="fixed -top-[100px] -right-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,rgba(99,102,241,0)_70%)] rounded-full pointer-events-none z-0 print:hidden" />
        <div className="relative z-10 w-full max-w-7xl mx-auto print:max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}
