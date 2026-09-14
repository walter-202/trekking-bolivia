import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './infrastructure/auth/AuthContext';
import { NativeHeader } from './presentation/components/native/NativeHeader';
import { NativeTabBar } from './presentation/components/native/NativeTabBar';
import { NativeExploreView } from './presentation/views/explore/NativeExploreView';
import { NativeActivityView } from './presentation/views/activity/NativeActivityView';
import { NativeRecordView } from './presentation/views/record/NativeRecordView';
import { NativeModerationView } from './presentation/views/moderation/NativeModerationView';
import { NativeProfileView } from './presentation/views/profile/NativeProfileView';
import { NativeAuthView } from './presentation/views/auth/NativeAuthView';
import { NativeUnitTestView } from './presentation/views/testRunner/NativeUnitTestView';
import { RouteModel, TabKey } from './core/domain/types';

function MainNavigator() {
  const [activeTab, setActiveTab] = useState<TabKey>('explore');
  const [previousTab, setPreviousTab] = useState<TabKey>('explore');
  const [preparedRoute, setPreparedRoute] = useState<RouteModel | null>(null);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  const handleSelectRouteForActivity = (route: RouteModel) => {
    setPreparedRoute(route);
    setActiveTab('activity');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
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

  const isFullScreenView = activeTab === 'auth' || activeTab === 'tests';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Top Header - Hidden on auth/tests */}
      {!isFullScreenView && (
        <NativeHeader
          onOpenAuth={() => handleOpenAuth('login')}
          onOpenTests={handleOpenTests}
          onOpenProfile={() => setActiveTab('profile')}
        />
      )}

      {/* Main View Area */}
      <View style={styles.body}>
        {activeTab === 'explore' && (
          <NativeExploreView
            onSelectRouteForActivity={handleSelectRouteForActivity}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {activeTab === 'activity' && (
          <NativeActivityView
            preparedRoute={preparedRoute}
            onClearPreparedRoute={() => setPreparedRoute(null)}
          />
        )}

        {activeTab === 'record' && <NativeRecordView />}

        {activeTab === 'moderation' && <NativeModerationView />}

        {activeTab === 'profile' && (
          <NativeProfileView onOpenAuth={() => handleOpenAuth('login')} />
        )}

        {activeTab === 'auth' && (
          <NativeAuthView
            initialMode={authInitialMode}
            onBack={handleBackToPrevious}
            onSuccess={handleBackToPrevious}
          />
        )}

        {activeTab === 'tests' && (
          <NativeUnitTestView onBack={handleBackToPrevious} />
        )}
      </View>

      {/* Bottom Tab Bar - Hidden on full screen views */}
      {!isFullScreenView && (
        <NativeTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#051712',
  },
  body: {
    flex: 1,
    backgroundColor: '#051712',
  },
});
