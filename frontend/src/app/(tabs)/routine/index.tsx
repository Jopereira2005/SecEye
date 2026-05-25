import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { PlusCircle } from "lucide-react-native";
import { Button } from "@/components/Button/button";
import { RoutineCard } from "@/components/RoutineCard/routine-card";
import { RoutineModal } from "@/components/RoutineModal/routine-modal";
import { styles } from "./_routine.styles";
import { CustomColors } from "@/constants/theme";
import { IRoutine } from "@/interfaces/routine.interface";

const MOCK_ROUTINES: IRoutine[] = [
  {
    id: 1,
    user_id: "user1",
    description: "Modo Noturno",
    is_active: true,
    hora_inicio: "22:00",
    hora_fim: "06:00",
    days_week: [0, 1, 2, 3, 4, 5, 6],
    repeat_type: 'everyday',
    specific_date: null,
  },
  {
    id: 2,
    user_id: "user1",
    description: "Modo Férias",
    is_active: false,
    hora_inicio: "00:00",
    hora_fim: "23:59",
    days_week: [],
    repeat_type: 'once',
    specific_date: null,
  },
  {
    id: 3,
    user_id: "user1",
    description: "Ausência Diária",
    is_active: false,
    hora_inicio: "08:30",
    hora_fim: "18:00",
    days_week: [1, 2, 3, 4, 5],
    repeat_type: 'weekly',
    specific_date: null,
  },
  {
    id: 4,
    user_id: "user1",
    description: "Fim de Semana",
    is_active: false,
    hora_inicio: "23:00",
    hora_fim: "09:00",
    days_week: [0, 6],
    repeat_type: 'weekly',
    specific_date: null,
  },
  {
    id: 5,
    user_id: "user1",
    description: "Monitoramento de Jardim",
    is_active: true,
    hora_inicio: "18:00",
    hora_fim: "06:00",
    days_week: [0, 1, 2, 3, 4, 5, 6],
    repeat_type: 'everyday',
    specific_date: null,
  }
];

export default function RoutineScreen() {
  const [routines, setRoutines] = useState<IRoutine[]>(MOCK_ROUTINES);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<IRoutine | null>(null);

  const handleSelect = (id: number) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  const handleToggle = (id: number) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r)),
    );
  };

  const handleCreateNew = () => {
    setEditingRoutine(null);
    setIsModalVisible(true);
  };

  const handleLongPress = (routine: IRoutine) => {
    setEditingRoutine(routine);
    setIsModalVisible(true);
  };

  const handleSaveRoutine = (savedRoutine: Partial<IRoutine>) => {
    if (editingRoutine) {
      setRoutines(prev => prev.map(r => r.id === savedRoutine.id ? { ...r, ...savedRoutine } : r));
    } else {
      const newRoutine: IRoutine = {
        ...(savedRoutine as IRoutine),
        id: Math.floor(Math.random() * 1000000),
        is_active: true,
      };
      setRoutines(prev => [...prev, newRoutine]);
    }
    setIsModalVisible(false);
  };

  const handleDeleteRoutine = (id: number) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Rotinas</Text>
          <Text style={styles.pageSubtitle}>
            Automatize a segurança da sua residência .
          </Text>
        </View>

        <View style={styles.listContainer}>
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              isActive={routine.is_active}
              isExpanded={selectedId === routine.id}
              onPress={() => handleSelect(routine.id)}
              onLongPress={() => handleLongPress(routine)}
              onToggle={() => handleToggle(routine.id)}
            />
          ))}
        </View>
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
