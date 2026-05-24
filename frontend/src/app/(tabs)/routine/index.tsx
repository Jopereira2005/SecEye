import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { PlusCircle } from "lucide-react-native";
import { Button } from "@/components/Button/button";
import { RoutineCard } from "@/components/RoutineCard/routine-card";
import { styles } from "./_routine.styles";
import { CustomColors } from "@/constants/theme";
import { IRoutine } from "@/interfaces/routine.interface";

type RoutineWithState = IRoutine & { isActive: boolean };

const MOCK_ROUTINES: RoutineWithState[] = [
  {
    id: "1",
    user_id: "user1",
    description: "Modo Noturno",
    isActive: true,
    hora_inicio: "22:00",
    hora_fim: "06:00",
    days_week: ["Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sab.", "Dom."],
  },
  {
    id: "2",
    user_id: "user1",
    description: "Modo Férias",
    isActive: false,
    hora_inicio: "00:00",
    hora_fim: "23:59",
    days_week: ["Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sab.", "Dom."],
  },
  {
    id: "3",
    user_id: "user1",
    description: "Ausência Diária",
    isActive: false,
    hora_inicio: "08:30",
    hora_fim: "18:00",
    days_week: ["Seg.", "Ter.", "Qua.", "Qui.", "Sex."],
  },
  {
    id: "4",
    user_id: "user1",
    description: "Fim de Semana",
    isActive: false,
    hora_inicio: "23:00",
    hora_fim: "09:00",
    days_week: ["Sab.", "Dom."],
  },
  {
    id: "5",
    user_id: "user1",
    description: "Monitoramento de Jardim",
    isActive: true,
    hora_inicio: "18:00",
    hora_fim: "06:00",
    days_week: ["Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sab.", "Dom."],
  }
];

export default function RoutineScreen() {
  const [routines, setRoutines] = useState<RoutineWithState[]>(MOCK_ROUTINES);
  const [selectedId, setSelectedId] = useState<string | null>("1");

  const handleSelect = (id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  const handleToggle = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
    );
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
              isActive={routine.isActive}
              isExpanded={selectedId === routine.id}
              onPress={() => handleSelect(routine.id)}
              onToggle={() => handleToggle(routine.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.floatingButtonContainer}>
        <Button variant="gradient" containerStyle={styles.createButton}>
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
    </View>
  );
}
