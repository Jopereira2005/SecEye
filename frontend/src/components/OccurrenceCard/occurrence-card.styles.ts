import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { CustomColors, CustomFonts, Spacing, Shadows } from '@/constants/theme';
import { moderateScale } from 'react-native-size-matters';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: CustomColors.quartenary,
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    ...Shadows.card,
  },
  
  // Imagem
  imageContainer: {
    position: 'relative',
    backgroundColor: CustomColors.grayScaleDark,
    overflow: 'hidden',
    borderRadius: moderateScale(12),
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CustomColors.grayScaleDark,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Overlay na imagem (gradiente sutil para ler textos se houver)
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  // Badge de Severidade (Fica em cima da imagem ou no conteúdo)
  severityBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    zIndex: 2,
  },

  severityText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(10),
    fontWeight: 'bold',
    color: CustomColors.light,
    textTransform: 'uppercase',
  },

  // Área de Conteúdo (Textos)
  contentContainer: {
    // Paddings específicos são aplicados pelas variantes (Large, Medium, Small)
  },

  // Row Superior (Câmera + Horário)
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  
  cameraNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  cameraName: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: CustomColors.light,
    flexShrink: 1,
  },

  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },

  timestampText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(12),
    color: CustomColors.grayScale,
  },
  
  // Rodapé do card
  footerRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(12),
    color: CustomColors.grayScale,
  },

  // Tamanhos (Variantes)
  // Large: Imagem grande no topo, textos em baixo
  containerLarge: {
    width: '100%',
    marginBottom: Spacing.md,
    padding: Spacing.sm,
  },

  imageLarge: {
    alignSelf: 'stretch',
    height: moderateScale(180),
  },
  
  // Medium: Card horizontal (imagem na esquerda, textos na direita)
  containerMedium: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.sm,
  },

  imageMedium: {
    width: moderateScale(60),
    height: moderateScale(60),
  },

  contentMedium: {
    flex: 1,
    paddingLeft: Spacing.sm,
    justifyContent: 'center',
  },

  // Small: Card pequeno, ideal para grid
  containerSmall: {
    flex: 1,
    width: '100%',
    marginBottom: Spacing.md,
    padding: Spacing.sm,
  },

  imageSmall: {
    alignSelf: 'stretch',
    aspectRatio: 4 / 3,
  },

  contentSmall: {
    paddingTop: Spacing.sm,
    flex: 1,
    justifyContent: 'space-between',
  },

  // Seleção
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(56, 189, 248, 0.1)', // Um azul primário suave
    borderWidth: 2,
    borderColor: CustomColors.primary,
    borderRadius: moderateScale(16),
    zIndex: 10,
  },
  
  checkIconContainer: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: CustomColors.primary,
    borderRadius: 12,
    padding: 4,
    zIndex: 11,
  },
});
