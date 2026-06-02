import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { OccurrencesScreen } from '@/screens/OccurrencesScreen/occurrences-screen';

export default function OccurrencesRoute() {
  const params = useLocalSearchParams();
  return <OccurrencesScreen openId={params.openId} />;
}
