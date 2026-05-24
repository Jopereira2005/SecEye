import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  TextInputProps, 
  ViewStyle 
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { CustomColors } from '@/constants/theme';
import { styles } from './input.styles';
import { moderateScale } from 'react-native-size-matters';

export interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  
  // Customization
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
}

export function Input({
  label,
  icon,
  isPassword = false,
  error,
  containerStyle,
  inputStyle,
  width,
  height,
  borderRadius = moderateScale(24),
  paddingHorizontal = moderateScale(16),
  paddingVertical = moderateScale(14),
  onFocus,
  onBlur,
  style,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const customWrapperStyle: any = {
    borderRadius,
    paddingHorizontal,
    paddingVertical,
  };

  if (width !== undefined) customWrapperStyle.width = width;
  if (height !== undefined) customWrapperStyle.height = height;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View 
        style={[
          styles.inputWrapper, 
          customWrapperStyle,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          inputStyle
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={CustomColors.grayScale}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus && onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeOff color={CustomColors.grayScale} size={moderateScale(20)} />
            ) : (
              <Eye color={CustomColors.grayScale} size={moderateScale(20)} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
