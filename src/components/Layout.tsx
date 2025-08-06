import { Navigation } from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="md:pl-64">
        <main className="py-6 px-4 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}