import Header from './Header';
import Footer from './Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white" suppressHydrationWarning>
      <style jsx global>{`
        html {
          color-scheme: light;
        }
        body {
          background-color: white;
        }
      `}</style>
      <Header />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
    </div>
  );
}

