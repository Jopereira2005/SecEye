import { StyleSheet, Dimensions } from "react-native";
import { CustomColors, CustomFonts, Spacing, Shadows } from "@/constants/theme";
import { moderateScale } from "react-native-size-matters";

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: CustomColors.dark,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingBottom: Spacing.md,
    maxHeight: height * 0.95,
    ...Shadows.card,
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  dragIndicator: {
    width: moderateScale(40),
    height: moderateScale(4),
    backgroundColor: CustomColors.grayScale,
    borderRadius: moderateScale(2),
  },

  // Conteúdo da Imagem Principal
  imageContainer: {
    width: '100%',
    backgroundColor: CustomColors.grayScaleDark,
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Badge de Severidade (Rodapé da Moldura)
  severityBanner: {
    width: '100%',
    paddingVertical: moderateScale(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
  },
  
  severityText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    color: CustomColors.light,
    textTransform: 'uppercase',
  },

  // Corpo do Modal
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  
  title: {
    flex: 1,
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: CustomColors.light,
  },

  // Info Grid
  infoGrid: {
    backgroundColor: CustomColors.quartenary,
    borderRadius: moderateScale(16),
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  infoText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.light,
    fontWeight: '500',
  },
  infoLabel: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(12),
    color: CustomColors.grayScale,
    marginTop: moderateScale(2),
  },

  // Botões de Ação
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  actionText: {
    fontWeight: 'bold',
    color: CustomColors.light,
  }
});
