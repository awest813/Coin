import { useGameStore } from '~/store/gameStore';
import { NavBar } from '~/components/NavBar';
import { GuildDashboard } from '~/components/screens/GuildDashboard';
import { MercenaryRoster } from '~/components/screens/MercenaryRoster';
import { MissionBoard } from '~/components/screens/MissionBoard';
import { InventoryPanel } from '~/components/screens/InventoryPanel';
import { ResultsModal } from '~/components/ResultsModal';

function App() {
  const { activeScreen } = useGameStore();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <NavBar />
      <main>
        {activeScreen === 'dashboard' && <GuildDashboard />}
        {activeScreen === 'roster' && <MercenaryRoster />}
        {activeScreen === 'missions' && <MissionBoard />}
        {activeScreen === 'inventory' && <InventoryPanel />}
      </main>
      <ResultsModal />
    </div>
  );
}

export default App;
