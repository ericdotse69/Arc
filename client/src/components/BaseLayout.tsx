import { ReactNode } from 'react';

interface BaseLayoutProps {
  children: ReactNode;
  title?: string;
}

export const BaseLayout = ({
  children,
  title,
}: BaseLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b-[1px] border-[#52525b] bg-[#09090b] px-8 py-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <h1 className="text-4xl font-bold text-[#fafafa] tracking-tight">
              Arc
            </h1>
            <p className="text-[#52525b] text-sm mt-2 font-light">
              Focus, Quantified
            </p>
          </div>
        </div>
      </header>

      {/* Main content area with strict grid */}
      <main className="px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left sidebar - for future navigation */}
          <aside className="col-span-2 border-r-[1px] border-[#52525b] pr-8">
            <nav className="space-y-4">
              <a
                href="/"
                className="block text-[#fafafa] text-sm font-medium hover:text-[#dc2626] transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/sessions"
                className="block text-[#fafafa] text-sm font-medium hover:text-[#dc2626] transition-colors"
              >
                Sessions
              </a>
              <a
                href="/analytics"
                className="block text-[#fafafa] text-sm font-medium hover:text-[#dc2626] transition-colors"
              >
                Analytics
              </a>
            </nav>
          </aside>

          {/* Main content */}
          <section className="col-span-10">
            {title && (
              <div className="border-b-[1px] border-[#52525b] pb-6 mb-8">
                <h2 className="text-2xl font-bold text-[#fafafa]">{title}</h2>
              </div>
            )}
            {children}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-[1px] border-[#52525b] px-8 py-6 mt-8">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <p className="text-[#52525b] text-xs">
              Arc © 2026 • Focus, Quantified
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
