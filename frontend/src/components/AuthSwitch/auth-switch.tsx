import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { styles } from "./auth-switch.styles";

interface AuthSwitchProps {
  activeTab: "login" | "sign-up";
  onTabChange: (tab: "login" | "sign-up") => void;
}

export function AuthSwitch({ activeTab, onTabChange }: AuthSwitchProps) {
  const slideAnim = useRef(
    new Animated.Value(activeTab === "login" ? 0 : 1),
  ).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeTab === "login" ? 0 : 1,
      duration: 150,
      useNativeDriver: false, // Animating left position
    }).start();
  }, [activeTab]);

  const leftPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <Animated.View style={[styles.slider, { left: leftPosition }]} />

        <Pressable style={styles.button} onPress={() => onTabChange("login")}>
          <Text
            style={[
              styles.inactiveText,
              activeTab === "login" && styles.activeText,
            ]}
          >
            ENTRAR
          </Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => onTabChange("sign-up")}>
          <Text
            style={[
              styles.inactiveText,
              activeTab === "sign-up" && styles.activeText,
            ]}
          >
            CADASTRAR
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
