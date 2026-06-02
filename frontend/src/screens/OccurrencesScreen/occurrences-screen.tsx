import React, { useState, useCallback, useEffect } from "react";
import { View, Text, RefreshControl, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { OccurrenceCard } from "@/components/OccurrenceCard/occurrence-card";
import { OccurrenceModal } from "@/components/OccurrenceModal/occurrence-modal";
import { OccurrenceFilterModal, IFilterState, INITIAL_FILTER_STATE } from "@/components/OccurrenceFilterModal/occurrence-filter-modal";
import { Button } from "@/components/Button/button";
import { styles } from "./occurrences-screen.styles";
import { CustomColors, Spacing } from "@/constants/theme";
import { IOcurrence } from "@/interfaces/ocurrence.interface";
import { ICamera } from "@/interfaces/camera.interface";
import { ShieldAlert, LayoutList, Square, SlidersHorizontal, Grid2X2 } from "lucide-react-native";

import { getCameras } from "@/services/cameras.service";
import { useOccurrences } from "@/hooks/use-occurrences";

export function OccurrencesScreen({ openId }: { openId?: string | string[] }) {
  const { occurrences, loading, refresh, removeOccurrences } = useOccurrences();
  const [cameras, setCameras] = useState<ICamera[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filterState, setFilterState] = useState<IFilterState>(INITIAL_FILTER_STATE);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  
  const [selectedOccurrence, setSelectedOccurrence] = useState<IOcurrence | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'large' | 'medium' | 'small'>('large');

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFetchingDeepLink, setIsFetchingDeepLink] = useState(false);

  useEffect(() => {
    // Carregar lista de câmeras ativas do usuário para os filtros
    getCameras().then(data => setCameras(data)).catch(err => console.error("Erro ao carregar câmeras", err));
  }, []);

  useEffect(() => {
    if (openId && typeof openId === 'string') {
      const fetchDeepLink = async () => {
        setIsFetchingDeepLink(true);
        // Simula o delay de requisição para a API real
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const found = occurrences.find(o => o.id === openId);
        if (found) {
          setSelectedOccurrence(found);
          setIsModalVisible(true);
        }
        setIsFetchingDeepLink(false);
      };

      fetchDeepLink();
    }
  }, [openId, occurrences]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const filteredOccurrences = React.useMemo(() => {
    let filtered = [...occurrences];

    // Filtro por Câmeras
    if (filterState.cameras.length > 0) {
      filtered = filtered.filter(o => o.camera_id && filterState.cameras.includes(o.camera_id));
    }

    // Filtro por Severidade
    if (filterState.severities.length > 0) {
      filtered = filtered.filter(o => o.camera?.severity && filterState.severities.includes(o.camera.severity));
    }

    // Filtro por Data
    if (filterState.dateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(o => {
        const occurrenceDate = new Date(o.timestamp);
        occurrenceDate.setHours(0, 0, 0, 0);

        if (filterState.dateRange === 'today') {
          return occurrenceDate.getTime() === today.getTime();
        } else if (filterState.dateRange === 'yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return occurrenceDate.getTime() === yesterday.getTime();
        } else if (filterState.dateRange === 'week') {
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);
          return occurrenceDate.getTime() >= lastWeek.getTime();
        }
        return true;
      });
    }

    return filtered;
  }, [occurrences, filterState]);

  const applyFilters = (filters: IFilterState) => {
    setFilterState(filters);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(i => i !== id);
        if (next.length === 0) setIsSelectionMode(false);
        return next;
      }
      return [...prev, id];
    });
  };

  const handleLongPress = (occurrence: IOcurrence) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds([occurrence.id]);
    }
  };

  const handlePressOccurrence = useCallback((occurrence: IOcurrence) => {
    if (isSelectionMode) {
      toggleSelection(occurrence.id);
    } else {
      setSelectedOccurrence(occurrence);
      setIsModalVisible(true);
    }
  }, [isSelectionMode]);

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      "Excluir Ocorrências",
      `Tem certeza que deseja excluir ${selectedIds.length} ocorrência(s)?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: () => {
            const idsToDelete = [...selectedIds];
            cancelSelection();
            removeOccurrences(idsToDelete);
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={styles.headerTitle}>Ocorrências</Text>
          <Text style={styles.headerSubtitle}>
            {filteredOccurrences.length} {filteredOccurrences.length === 1 ? 'registro encontrado' : 'registros encontrados'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, backgroundColor: CustomColors.quartenary, padding: 6, borderRadius: 8 }}>
          <TouchableOpacity onPress={() => setViewMode('large')}>
            <Square color={viewMode === 'large' ? CustomColors.primary : CustomColors.grayScale} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('medium')}>
            <LayoutList color={viewMode === 'medium' ? CustomColors.primary : CustomColors.grayScale} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('small')}>
            <Grid2X2 color={viewMode === 'small' ? CustomColors.primary : CustomColors.grayScale} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barra de Filtros e Seleção */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          <Button 
            variant="secondary"
            size="small"
            style={{ borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignSelf: 'center' }}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SlidersHorizontal size={16} color={CustomColors.light} />
              <Text style={[styles.filterPillText, { color: CustomColors.light }]}>Filtros Avançados</Text>
              
              {/* Indicador de Filtros Ativos */}
              {(filterState.cameras.length > 0 || filterState.severities.length > 0 || filterState.dateRange !== 'all') && (
                <View style={{ backgroundColor: CustomColors.primary, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: CustomColors.dark }}>
                    {filterState.cameras.length + filterState.severities.length + (filterState.dateRange !== 'all' ? 1 : 0)}
                  </Text>
                </View>
              )}
            </View>
          </Button>

          {/* Indicador de Seleção Múltipla */}
          {isSelectionMode && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.xs }}>
              <View style={{ backgroundColor: CustomColors.quartenary, borderRadius: 20, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: CustomColors.primary, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: CustomColors.primary, fontWeight: 'bold', fontSize: 14 }}>
                  {selectedIds.length} {selectedIds.length === 1 ? 'selecionada' : 'selecionadas'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.mainContent}>
        {loading && !refreshing ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={CustomColors.primary} />
          </View>
        ) : (
          <FlashList
            key={viewMode}
            data={filteredOccurrences}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'small' ? 2 : 1}
            // @ts-ignore - Prop exists in FlashList but TS is complaining in v2
            estimatedItemSize={250}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={CustomColors.primary}
                colors={[CustomColors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ShieldAlert size={48} color={CustomColors.grayScaleDark} />
                <Text style={styles.emptyText}>Nenhuma ocorrência encontrada.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={viewMode === 'small' ? { flex: 1, padding: 8 } : undefined}>
                <OccurrenceCard 
                  occurrence={item} 
                  size={viewMode}
                  onPress={handlePressOccurrence}
                  onLongPress={handleLongPress}
                  selectable={isSelectionMode}
                  selected={selectedIds.includes(item.id)}
                />
              </View>
            )}
          />
        )}
      </View>

      {/* Overlay de Loading do Deep Link */}
      {isFetchingDeepLink && (
        <View style={styles.deepLinkLoadingOverlay}>
          <ActivityIndicator size="large" color={CustomColors.primary} />
          <Text style={styles.deepLinkLoadingText}>Buscando detalhes...</Text>
        </View>
      )}

      {/* Floating Action Bar para Deleção */}
      {isSelectionMode && (
        <View style={styles.floatingActionBar}>
          <Button 
            variant="gradient"
            size="medium"
            onPress={cancelSelection} 
            style={{ flex: 1, borderRadius: 12}}
          >
            <Text style={{ color: CustomColors.light, fontWeight: 'bold', fontSize: 14 }}>Cancelar</Text>
          </Button>

          <Button 
            variant="danger"
            size="medium"
            onPress={handleDeleteSelected} 
            style={{ flex: 1, borderRadius: 12 }}
          >
            <Text style={{ color: CustomColors.light, fontWeight: 'bold', fontSize: 14 }}>Excluir {selectedIds.length}</Text>
          </Button>
        </View>
      )}

      <OccurrenceFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={applyFilters}
        initialFilters={filterState}
        cameras={cameras}
      />

      <OccurrenceModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        occurrence={selectedOccurrence}
      />
    </View>
  );
}
