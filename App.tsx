import { useAuth } from '@/lib/authContext';
import { useRouter } from '@/lib/routerContext';
import { AppLayout } from '@/components/AppLayout';
import { AuthScreen } from '@/screens/AuthScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { AnalyzeScreen } from '@/screens/AnalyzeScreen';
import { ResultScreen } from '@/screens/ResultScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { StrategyScreen } from '@/screens/StrategyScreen';
import { LiveMarketScreen } from '@/screens/LiveMarketScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

function App() {
  const { session, loading } = useAuth();
  const { route } = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0e17]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <AppLayout>
      {route.name === 'dashboard' && <DashboardScreen />}
      {route.name === 'analyze' && <AnalyzeScreen />}
      {route.name === 'result' && <ResultScreen analysisId={route.analysisId} />}
      {route.name === 'history' && <HistoryScreen />}
      {route.name === 'strategy' && <StrategyScreen strategyId={route.strategyId} />}
      {route.name === 'market' && <LiveMarketScreen />}
      {route.name === 'settings' && <SettingsScreen />}
    </AppLayout>
  );
}

export default App;
