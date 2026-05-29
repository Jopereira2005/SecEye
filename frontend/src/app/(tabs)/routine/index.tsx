import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { PlusCircle, SlidersHorizontal } from "lucide-react-native";
import { Button } from "@/components/Button/button";
import { RoutineCard } from "@/components/RoutineCard/routine-card";
import { RoutineModal } from "@/components/RoutineModal/routine-modal";
import { RoutineFilterModal, IRoutineFilterState, INITIAL_ROUTINE_FILTER_STATE } from "@/components/RoutineFilterModal/routine-filter-modal";
import { styles } from "./_routine.styles";
import { CustomColors } from "@/constants/theme";
import { IRoutine } from "@/interfaces/routine.interface";
import { useRoutines } from "@/hooks/use-routines";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RoutineScreen() {
  const {
    routines,
    loading,
    toggleRoutine,
    saveRoutine,
    removeRoutine,
  } = useRoutines();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<IRoutine | null>(null);

  const [filterState, setFilterState] = useState<IRoutineFilterState>(INITIAL_ROUTINE_FILTER_STATE);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filterScale = useSharedValue(1);
  const filterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterScale.value }]
  }));

  const filteredRoutines = useMemo(() => {
    return routines.filter(r => {
      // Nome
      if (filterState.searchQuery && !r.description?.toLowerCase().includes(filterState.searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status
      if (filterState.status === 'active' && !r.is_active) return false;
      if (filterState.status === 'inactive' && r.is_active) return false;

      // Repeat Type
      if (filterState.repeatType !== 'all' && r.repeat_type !== filterState.repeatType) return false;

      // Days of week
      if (filterState.days.length > 0) {
        if (r.repeat_type === 'once') return false; 
        if (r.repeat_type === 'everyday') return true;
        if (r.repeat_type === 'weekly' && r.days_week) {
          const hasMatch = r.days_week.some(d => filterState.days.includes(d));
          if (!hasMatch) return false;
        }
      }

      return true;
    });
  }, [routines, filterState]);

  const handleSelect = (id: number) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  const handleCreateNew = () => {
    setEditingRoutine(null);
    setIsModalVisible(true);
  };

  const handleLongPress = (routine: IRoutine) => {
    setEditingRoutine(routine);
    setIsModalVisible(true);
  };

  const handleSaveRoutine = async (savedRoutine: Partial<IRoutine>) => {
    await saveRoutine(savedRoutine);
    setIsModalVisible(false);
  };

  const handleDeleteRoutine = async (id: number) => {
    await removeRoutine(id);
    setIsModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CustomColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Rotinas</Text>
            <Text style={styles.pageSubtitle}>
              Automatize a segurança da sua residência através de rotinas personalizadas.
            </Text>
          </View>
          
          <AnimatedPressable 
            style={[
              { 
                backgroundColor: CustomColors.quartenary, 
                padding: 10, 
                borderRadius: 12, 
                borderWidth: 1, 
                borderColor: 'rgba(255,255,255,0.05)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 4
              },
              filterAnimatedStyle
            ]}
            onPressIn={() => filterScale.value = withTiming(0.9, { duration: 100 })}
            onPressOut={() => filterScale.value = withTiming(1, { duration: 150 })}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <SlidersHorizontal size={20} color={CustomColors.primary} />
            
            {/* Indicador de Filtros Ativos */}
            {(filterState.searchQuery || filterState.status !== 'all' || filterState.repeatType !== 'all' || filterState.days.length > 0) && (
              <View style={{ 
                position: 'absolute', 
                top: -6, 
                right: -6, 
                backgroundColor: CustomColors.primary, 
                borderRadius: 10, 
                minWidth: 16, 
                height: 16, 
                paddingHorizontal: 4,
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: CustomColors.dark }}>
                  {
                    (filterState.searchQuery ? 1 : 0) + 
                    (filterState.status !== 'all' ? 1 : 0) + 
                    (filterState.repeatType !== 'all' ? 1 : 0) + 
                    (filterState.days.length > 0 ? 1 : 0)
                  }
                </Text>
              </View>
            )}
          </AnimatedPressable>
        </View>

        {filteredRoutines.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma rotina encontrada.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredRoutines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                isActive={routine.is_active}
                isExpanded={selectedId === routine.id}
                onPress={() => handleSelect(routine.id)}
                onLongPress={() => handleLongPress(routine)}
                onToggle={() => toggleRoutine(routine.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.floatingButtonContainer}>
        <Button variant="gradient" containerStyle={styles.createButton} onPress={handleCreateNew}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <PlusCircle
              color={CustomColors.light}
              size={24}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.createButtonText}>Criar Nova Rotina</Text>
          </View>
        </Button>
      </View>

      <RoutineFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={(filters) => setFilterState(filters)}
        initialFilters={filterState}
      />

      <RoutineModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveRoutine}
        onDelete={handleDeleteRoutine}
        routine={editingRoutine}
      />
    </View>
  );
}
