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
import { Market } from '~/components/screens/Market';
import { WarRoom } from '~/components/screens/WarRoom';
import { Settings } from '~/components/screens/Settings';
import { ResultsModal } from '~/components/ResultsModal';
import { OfflineModal } from '~/components/OfflineModal';
import { GuildScene } from '~/babylon/GuildScene';
import { ToastContainer } from '~/components/ToastContainer';
import { HeroQuestModal } from '~/components/HeroQuestModal';
import { MainMenu } from '~/components/MainMenu';
import { VictoryScreen } from '~/components/VictoryScreen';
import { WEATHER_IDS } from '~/types/guild';

const Embers = () => (
  <div className="embers-overlay">
    {[...Array(30)].map((_, i) => (
      <div 
        key={i} 
        className="ember" 
        style={{ 
          left: `${Math.random() * 100}%`,
          '--duration': `${10 + Math.random() * 15}s`,
          '--x-drift': `${(Math.random() - 0.5) * 400}px`,
          animationDelay: `${Math.random() * -20}s`
        } as any} 
      />
    ))}
  </div>
);

function App() {
  const { activeScreen, isInMainMenu, setInMainMenu, tick, calculateOfflineProgress, campaignStage } = useGameStore();

  useEffect(() => {
    // Wait a tiny bit for hydration to be certain, though Zustand persist is usually ready
    const timer = setTimeout(() => {
      calculateOfflineProgress();
    }, 100);
    
    const interval = setInterval(tick, 1000);

    // Phase 1 Welcome Toast
    const state = useGameStore.getState();
    if (state.guild.completedContracts === 0 && state.activeMissions.length === 0) {
      setTimeout(() => {
        state.addToast("Welcome, Commander. The Tarnished Banner is yours. Check the Contract Board to begin.", 'info');
      }, 2000);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [tick, calculateOfflineProgress]);

  useEffect(() => {
    window.render_game_to_text = () => {
      const state = useGameStore.getState();
      return JSON.stringify({
        coordinateSystem: 'React UI plus Babylon guild diorama; screen origin is top-left in CSS pixels.',
        mode: state.isInMainMenu ? 'main_menu' : 'guild',
        activeScreen: state.activeScreen,
        guild: {
          name: state.guild.name,
          rank: state.guild.guildRank,
          resources: state.guild.resources,
          completedContracts: state.guild.completedContracts,
          weather: WEATHER_IDS.includes(state.guild.currentWeather)
            ? state.guild.currentWeather
            : 'clear',
          morale: state.guild.guildMorale,
          stockpileSize: Object.values(state.guild.consumableStockpile).reduce((s, q) => s + q, 0),
        },
        activeMissions: state.activeMissions.map((mission) => ({
          id: mission.missionRunId,
          templateId: mission.templateId,
          assignedMercIds: mission.assignedMercIds,
          endTime: mission.endTime,
        })),
        roster: {
          total: state.mercenaries.length,
          ready: state.mercenaries.filter((merc) => !merc.isInjured && !merc.isFatigued).length,
          injured: state.mercenaries.filter((merc) => merc.isInjured).length,
          fatigued: state.mercenaries.filter((merc) => merc.isFatigued && !merc.isInjured).length,
        },
        pendingEvents: state.pendingEvents.length,
      });
    };

    window.advanceTime = (ms: number) => {
      const steps = Math.max(1, Math.round(ms / 1000));
      for (let i = 0; i < steps; i++) {
        useGameStore.getState().tick();
      }
    };

    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, []);

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
      <Embers />
      
      {isInMainMenu && <MainMenu />}
      
      {/* Victory Finale */}
      {campaignStage >= 5 && <VictoryScreen />}
      
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
          {activeScreen === 'market' && <Market />}
          {activeScreen === 'warroom' && <WarRoom />}
          {activeScreen === 'settings' && <Settings />}
        </main>
      </div>
      
      <ResultsModal />
      <OfflineModal />
      <HeroQuestModal />
      <ToastContainer />
    </div>
  );
}

export default App;


