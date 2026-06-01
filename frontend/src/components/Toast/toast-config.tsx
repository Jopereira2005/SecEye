import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';
import { CustomColors, CustomFonts, Spacing } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

// Type definitions to help TS infer custom props if we pass them
interface CustomToastProps extends BaseToastProps {
  props?: any;
}

const BaseToast = ({ text1, text2, icon, borderColor }: { text1?: string, text2?: string, icon: React.ReactNode, borderColor: string }) => (
  <View style={[styles.toastContainer, { borderLeftColor: borderColor }]}>
    <View style={styles.iconContainer}>
      {icon}
    </View>
    <View style={styles.textContainer}>
      {text1 ? <Text style={styles.text1}>{text1}</Text> : null}
      {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: CustomToastProps) => (
    <BaseToast
      text1={props.text1}
      text2={props.text2}
      borderColor={CustomColors.success}
      icon={<CheckCircle2 color={CustomColors.success} size={24} />}
    />
  ),
  error: (props: CustomToastProps) => (
    <BaseToast
      text1={props.text1}
      text2={props.text2}
      borderColor={CustomColors.danger}
      icon={<XCircle color={CustomColors.danger} size={24} />}
    />
  ),
  info: (props: CustomToastProps) => (
    <BaseToast
      text1={props.text1}
      text2={props.text2}
      borderColor={CustomColors.primary}
      icon={<Info color={CustomColors.primary} size={24} />}
    />
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    backgroundColor: CustomColors.quartenary,
    borderRadius: 12,
    borderLeftWidth: 6,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: Spacing.md, // Spacing from the top notch
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text1: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: CustomColors.light,
    marginBottom: 2,
  },
  text2: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(12),
    color: CustomColors.grayScale,
  },
});
