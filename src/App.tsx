import { useEffect } from 'react';
import { useGameStore } from '~/store/gameStore';
import { NavBar } from '~/components/NavBar';
import { GuildDashboard } from '~/components/screens/GuildDashboard';
import { MercenaryRoster } from '~/components/screens/MercenaryRoster';
import { MissionBoard } from '~/components/screens/MissionBoard';
import { InventoryPanel } from '~/components/screens/InventoryPanel';
import { Workshop } from '~/components/screens/Workshop';
import { HiringHall } from '~/components/screens/HiringHall';
import { ExpeditionPanel } from '~/components/screens/ExpeditionPanel';
import { WorldMap } from '~/components/screens/WorldMap';
import { Reliquary } from '~/components/screens/Reliquary';
import { GuildChronicles } from './components/screens/GuildChronicles';
import { DioramaShop } from '~/components/screens/DioramaShop';
import { GuildPolicies } from '~/components/screens/GuildPolicies';
import { ResultsModal } from '~/components/ResultsModal';
import { OfflineModal } from '~/components/OfflineModal';
import { MainMenu } from '~/components/MainMenu';
import { HeroQuestModal } from '~/components/HeroQuestModal';

function App() {
  const { activeScreen, isInMainMenu, setInMainMenu, tick, calculateOfflineProgress } = useGameStore();

  useEffect(() => {
    // Wait a tiny bit for hydration to be certain, though Zustand persist is usually ready
    const timer = setTimeout(() => {
      calculateOfflineProgress();
    }, 100);
    
    const interval = setInterval(tick, 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [tick, calculateOfflineProgress]);

  // Handle Escape to Menu
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInMainMenu(true);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setInMainMenu]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-primary/20 selection:text-primary/80 relative">
      <div className="noise-overlay" />
      
      {isInMainMenu && <MainMenu />}
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 pb-20">
          {activeScreen === 'dashboard' && <GuildDashboard />}
          {activeScreen === 'roster' && <MercenaryRoster />}
          {activeScreen === 'missions' && <MissionBoard />}
          {activeScreen === 'inventory' && <InventoryPanel />}
          {activeScreen === 'workshop' && <Workshop />}
          {activeScreen === 'hiring' && <HiringHall />}
          {activeScreen === 'expeditions' && <ExpeditionPanel />}
          {activeScreen === 'worldmap' && <WorldMap />}
          {activeScreen === 'reliquary' && <Reliquary />}
          {activeScreen === 'chronicles' && <GuildChronicles />}
          {activeScreen === 'customization' && <DioramaShop />}
          {activeScreen === 'policies' && <GuildPolicies />}
        </main>
      </div>
      
      <ResultsModal />
      <OfflineModal />
      <HeroQuestModal />
    </div>
  );
}

export default App;


