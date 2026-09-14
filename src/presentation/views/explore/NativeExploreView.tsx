import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import {
  Compass,
  Search,
  Mountain,
  Clock,
  TrendingUp,
  MapPin,
  CheckCircle2,
  DownloadCloud,
} from 'lucide-react-native';
import { useTrekkingStore } from '../../../infrastructure/persistence/useTrekkingStore';
import { RouteModel, RouteDifficulty } from '../../../core/domain/types';
import { NativeTrekkingMap } from '../../components/map/NativeTrekkingMap';
import { AndeanTheme } from '../../theme';

interface NativeExploreViewProps {
  onSelectRouteForActivity: (route: RouteModel) => void;
  onOpenAuth: () => void;
}

export const NativeExploreView: React.FC<NativeExploreViewProps> = ({
  onSelectRouteForActivity,
}) => {
  const { routes, offlineRegions, addOfflineRegion } = useTrekkingStore();
  const [selectedRoute, setSelectedRoute] = useState<RouteModel>(routes[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || r.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const handleDownloadSector = (route: RouteModel) => {
    addOfflineRegion({
      id: `region-${route.id}`,
      name: `${route.title} (Sector Cordillera)`,
      minLat: route.startPoint.lat - 0.05,
      maxLat: route.endPoint.lat + 0.05,
      minLng: route.startPoint.lng - 0.05,
      maxLng: route.endPoint.lng + 0.05,
      minZoom: 11,
      maxZoom: 16,
      tileCount: 140,
      downloadedCount: 140,
      status: 'completed',
      createdAt: Date.now(),
      sizeBytes: 12.5 * 1024 * 1024,
    });
    setDownloadSuccessId(route.id);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  const getDifficultyColor = (diff: RouteDifficulty) => {
    switch (diff) {
      case 'facil':
        return '#34D399';
      case 'moderado':
        return '#60A5FA';
      case 'dificil':
        return '#F59E0B';
      case 'experto':
        return '#EF4444';
      default:
        return '#10B981';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Search and Filters Header */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar rutas, cumbres, guías..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'facil', label: 'Fácil' },
            { id: 'moderado', label: 'Moderado' },
            { id: 'dificil', label: 'Difícil' },
            { id: 'experto', label: 'Experto' },
          ].map((pill) => {
            const isSelected = difficultyFilter === pill.id;
            return (
              <Pressable
                key={pill.id}
                onPress={() => setDifficultyFilter(pill.id)}
                style={[styles.pill, isSelected && styles.pillActive]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {pill.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Topographic Map Preview */}
      {selectedRoute ? (
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View style={styles.mapTitleRow}>
              <Mountain size={14} color="#10B981" />
              <Text style={styles.mapTitleText}>{selectedRoute.title}</Text>
            </View>
            <View
              style={[
                styles.diffTag,
                { backgroundColor: `${getDifficultyColor(selectedRoute.difficulty)}25` },
              ]}
            >
              <Text
                style={[
                  styles.diffTagText,
                  { color: getDifficultyColor(selectedRoute.difficulty) },
                ]}
              >
                {selectedRoute.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          <NativeTrekkingMap
            waypoints={selectedRoute.waypoints}
            checkpoints={selectedRoute.checkpoints}
            startPoint={selectedRoute.startPoint}
            endPoint={selectedRoute.endPoint}
            height={200}
            title={`${selectedRoute.title} (Topografía)`}
          />

          <View style={styles.routeActionRow}>
            <Pressable
              onPress={() => onSelectRouteForActivity(selectedRoute)}
              style={styles.btnStartActivity}
            >
              <Compass size={15} color="#FFFFFF" />
              <Text style={styles.btnStartText}>Iniciar Expedición</Text>
            </Pressable>

            <Pressable
              onPress={() => handleDownloadSector(selectedRoute)}
              style={styles.btnDownload}
            >
              {downloadSuccessId === selectedRoute.id ? (
                <>
                  <CheckCircle2 size={15} color="#34D399" />
                  <Text style={styles.btnDownloadTextDone}>Descargado</Text>
                </>
              ) : (
                <>
                  <DownloadCloud size={15} color="#A7F3D0" />
                  <Text style={styles.btnDownloadText}>Bajar Offline</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Route List */}
      <Text style={styles.sectionHeader}>Rutas Disponibles ({filteredRoutes.length})</Text>

      {filteredRoutes.map((route) => {
        const isSelected = selectedRoute?.id === route.id;
        const isDownloaded = offlineRegions.some((r) => r.id === `region-${route.id}`);

        return (
          <Pressable
            key={route.id}
            onPress={() => setSelectedRoute(route)}
            style={[styles.routeCard, isSelected && styles.routeCardSelected]}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.routeName}>{route.title}</Text>
                <View style={styles.metaRow}>
                  <MapPin size={11} color="#6B7280" />
                  <Text style={styles.metaText}>{route.startPoint.name}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.badgeDiff,
                  { backgroundColor: `${getDifficultyColor(route.difficulty)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.badgeDiffText,
                    { color: getDifficultyColor(route.difficulty) },
                  ]}
                >
                  {route.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.routeDesc} numberOfLines={2}>
              {route.description}
            </Text>

            {/* Tactical Metrics Bar */}
            <View style={styles.metricsBar}>
              <View style={styles.metricItem}>
                <TrendingUp size={12} color="#10B981" />
                <Text style={styles.metricVal}>{route.distanceKm} km</Text>
              </View>

              <View style={styles.metricItem}>
                <Mountain size={12} color="#F59E0B" />
                <Text style={styles.metricVal}>+{route.elevationGainM || 350}m</Text>
              </View>

              <View style={styles.metricItem}>
                <Clock size={12} color="#60A5FA" />
                <Text style={styles.metricVal}>~{Math.round(route.durationMinutes / 60)}h</Text>
              </View>

              {isDownloaded ? (
                <View style={styles.downloadedPill}>
                  <CheckCircle2 size={10} color="#34D399" />
                  <Text style={styles.downloadedText}>Offline</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#051712',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0E2E24',
    borderWidth: 1,
    borderColor: '#1A4537',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    color: '#F9FAFB',
    fontSize: 13,
  },
  filterScroll: {
    flexDirection: 'row',
    marginTop: 10,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0A241C',
    borderWidth: 1,
    borderColor: '#154837',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
  },
  pillText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapCard: {
    backgroundColor: '#0A241C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 12,
    marginBottom: 20,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapTitleText: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '700',
  },
  diffTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  diffTagText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  routeActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  btnStartActivity: {
    flex: 1.2,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnStartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  btnDownload: {
    flex: 1,
    backgroundColor: '#0E2E24',
    borderWidth: 1,
    borderColor: '#1A4537',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnDownloadText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '600',
  },
  btnDownloadTextDone: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  routeCard: {
    backgroundColor: '#0E2E24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A4537',
    padding: 14,
    marginBottom: 12,
  },
  routeCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#12382C',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeName: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    color: '#6B7280',
    fontSize: 11,
  },
  badgeDiff: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeDiffText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  routeDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 16,
    marginVertical: 8,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 69, 55, 0.6)',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '600',
  },
  downloadedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  downloadedText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
