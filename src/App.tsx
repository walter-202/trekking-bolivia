import React, { useState } from 'react';
import { AuthProvider, useAuth } from './infrastructure/auth/AuthContext';
import { useTrekkingStore } from './infrastructure/persistence/useTrekkingStore';
import { ExploreView } from './presentation/views/explore/ExploreView';
import { ActivityView } from './presentation/views/activity/ActivityView';
import { RecordView } from './presentation/views/record/RecordView';
import { ModerationView } from './presentation/views/moderation/ModerationView';
import { ProfileView } from './presentation/views/profile/ProfileView';
import { UnitTestView } from './presentation/views/testRunner/UnitTestView';
import { AuthView } from './presentation/views/auth/AuthView';
import { AndeanSidebar } from './presentation/components/navigation/AndeanSidebar';
import { RouteModel, TabKey } from './core/domain/types';
import {
  Mountain,
  Wifi,
  WifiOff,
  FlaskConical,
  Menu,
  User,
} from 'lucide-react';

function AppContent() {
  const { currentUser } = useAuth();
  const { isOfflineMode, toggleOfflineMode } = useTrekkingStore();

  const [activeTab, setActiveTab] = useState<TabKey>('explore');
  const [previousTab, setPreviousTab] = useState<TabKey>('explore');
  const [preparedRoute, setPreparedRoute] = useState<RouteModel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  const handleSelectRouteForActivity = (route: RouteModel) => {
    setPreparedRoute(route);
    setActiveTab('activity');
  };

  const handleOpenAuth = (mode: 'register' | 'login' = 'login') => {
    setAuthMode(mode);
    setPreviousTab(activeTab === 'auth' || activeTab === 'tests' ? 'explore' : activeTab);
    setActiveTab('auth');
  };

  const handleOpenTests = () => {
    setPreviousTab(activeTab === 'auth' || activeTab === 'tests' ? 'explore' : activeTab);
    setActiveTab('tests');
  };

  const handleBackToPrevious = () => {
    setActiveTab(previousTab || 'explore');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-start text-stone-900 font-sans antialiased">
      {/* Andean Dark Sidebar Drawer (occupies >= 60% viewport width) */}
      <AndeanSidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onClose={() => setIsSidebarOpen(false)}
        onSelectTab={(tab) => {
          if (tab === 'auth') {
            handleOpenAuth('login');
          } else if (tab === 'tests') {
            handleOpenTests();
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* Container simulating high-end mobile/tablet device shell */}
      <div className="w-full max-w-lg min-h-screen bg-white shadow-xl flex flex-col border-x border-stone-200/80 relative">
        {/* Top App Header - Hidden on full dedicated auth and test screens */}
        {activeTab !== 'auth' && activeTab !== 'tests' && (
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Tactical Drawer Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 transition-colors border border-stone-200 cursor-pointer"
                title="Abrir Menú Andino"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#051712] text-emerald-400 flex items-center justify-center shadow-xs border border-emerald-900/40">
                  <Mountain className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>Trekking Bolivia</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-mono font-semibold">
                      PRO v2.4
                    </span>
                  </h1>
                  <p className="text-[10px] text-stone-500">Senderismo & Andes Offline</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* User Profile / Auth Button */}
              <button
                onClick={() => {
                  if (currentUser) {
                    setActiveTab('profile');
                  } else {
                    handleOpenAuth('register');
                  }
                }}
                title={currentUser ? `Conectado como ${currentUser.displayName}` : 'Crear Cuenta o Iniciar Sesión'}
                className="px-2 py-1 rounded-xl bg-stone-100 hover:bg-emerald-50 border border-stone-200 text-stone-700 hover:text-emerald-800 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[9px]">
                  {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : <User className="w-2.5 h-2.5" />}
                </div>
                <span className="hidden sm:inline max-w-10px truncate text-[10px]">
                  {currentUser?.displayName?.split(' ')[0] || 'Acceder'}
                </span>
              </button>

              {/* Run Unit Tests Screen Button */}
              <button
                onClick={handleOpenTests}
                title="Ver Pantalla de Pruebas Unitarias"
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-700" />
              </button>

              {/* Offline toggle badge */}
              <button
                onClick={() => toggleOfflineMode()}
                title="Alternar Modo Offline"
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${isOfflineMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
              >
                {isOfflineMode ? (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-700" /> Offline
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-700" /> Online
                  </>
                )}
              </button>
            </div>
          </header>
        )}

        {/* Dedicated Full Screen Views (No Modals) */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'explore' && (
            <div className="p-3.5">
              <ExploreView
                onSelectRouteForActivity={handleSelectRouteForActivity}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-3.5">
              <ActivityView
                preparedRoute={preparedRoute}
                onClearPreparedRoute={() => setPreparedRoute(null)}
              />
            </div>
          )}

          {activeTab === 'record' && (
            <div className="p-3.5">
              <RecordView />
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="p-3.5">
              <ModerationView />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="p-3.5">
              <ProfileView />
            </div>
          )}

          {activeTab === 'auth' && (
            <AuthView
              initialMode={authMode}
              onBack={handleBackToPrevious}
              onSuccess={handleBackToPrevious}
            />
          )}

          {activeTab === 'tests' && (
            <UnitTestView onBack={handleBackToPrevious} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
