export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#060608]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f0f14] border-r border-border-subtle hidden md:flex flex-col">
        <div className="p-6 border-b border-border-subtle">
          <h1 className="text-xl font-bold font-serif text-accent-primary">KhaduOS</h1>
          <p className="text-xs text-text-muted mt-1">Enterprise Command Center</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="/admin/orders" className="block px-4 py-2.5 rounded-lg text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors">
            🛒 Orders CRM
          </a>
          <a href="/admin/products" className="block px-4 py-2.5 rounded-lg text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors">
            📦 Products & Funnels
          </a>
          <a href="#" className="block px-4 py-2.5 rounded-lg text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors">
            👥 Customers
          </a>
          <a href="/admin/financials" className="block px-4 py-2.5 rounded-lg text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors">
            📈 P&L Financials
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#0f0f14] border-b border-border-subtle flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-text-primary">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-accent-primary/20 border border-accent-primary/50 flex items-center justify-center text-sm font-bold text-accent-primary">
              KF
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
