import { useState } from 'react';
import { LayoutDashboard, Camera, History, Settings, LogOut, Menu, X, LineChart, Activity } from 'lucide-react';
import { useRouter, Route } from '@/lib/routerContext';
import { useAuth } from '@/lib/authContext';
import { INSTRUMENT } from '@/lib/constants';

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  route: Route;
  matches: (r: Route) => boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, route: { name: 'dashboard' }, matches: (r) => r.name === 'dashboard' },
  { label: 'Analyze', icon: Camera, route: { name: 'analyze' }, matches: (r) => r.name === 'analyze' || r.name === 'result' },
  { label: 'Live Market', icon: Activity, route: { name: 'market' }, matches: (r) => r.name === 'market' },
  { label: 'History', icon: History, route: { name: 'history' }, matches: (r) => r.name === 'history' },
  { label: 'Strategies', icon: LineChart, route: { name: 'strategy', strategyId: 'strategy1' }, matches: (r) => r.name === 'strategy' },
  { label: 'Settings', icon: Settings, route: { name: 'settings' }, matches: (r) => r.name === 'settings' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { route, navigate } = useRouter();
  const { signOut, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (r: Route) => {
    navigate(r);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-200">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-white/10 bg-black/40 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
            <LineChart className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">XAUUSD AI</p>
            <p className="text-[10px] text-slate-500">Trading Analysis</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = item.matches(route);
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.route)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-3 py-4">
          <div className="mb-2 truncate px-3 text-xs text-slate-500">{user?.email}</div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/60 backdrop-blur-xl px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
            <LineChart className="h-4 w-4 text-black" />
          </div>
          <span className="text-sm font-bold text-white">XAUUSD AI</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-white/10 bg-[#0d1220] backdrop-blur-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="text-sm font-bold text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const active = item.matches(route);
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.route)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-white/10 px-3 py-4">
              <div className="mb-2 truncate px-3 text-xs text-slate-500">{user?.email}</div>
              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="relative lg:pl-60">
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-24 lg:px-8 lg:pt-8 lg:pb-12">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-black/70 backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 4).map((item) => {
          const active = item.matches(route);
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item.route)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition ${active ? 'text-amber-400' : 'text-slate-500'}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
        <button
          onClick={() => handleNav({ name: 'settings' })}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition ${route.name === 'settings' ? 'text-amber-400' : 'text-slate-500'}`}
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
