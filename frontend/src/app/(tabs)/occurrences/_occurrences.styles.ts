import { StyleSheet } from "react-native";
import { CustomColors, CustomFonts, Spacing, Shadows } from "@/constants/theme";
import { moderateScale } from "react-native-size-matters";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.dark,
  },

  mainContent: {
    flex: 1,
  },
  
  // Lista
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: moderateScale(100),
  },

  // Header interno de navegação / Filtros rápidos
  filterBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: CustomColors.dark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },

  filterContent: {
    gap: Spacing.sm,
  },

  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: moderateScale(20),
    backgroundColor: CustomColors.quartenary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },

  filterPillActive: {
    backgroundColor: CustomColors.primary,
    borderColor: CustomColors.primary,
  },

  filterPillText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
    fontWeight: '500',
  },

  filterPillTextActive: {
    color: CustomColors.dark,
    fontWeight: 'bold',
  },

  // Área superior com informações
  headerContainer: {
    marginBottom: Spacing.md,
  },

  headerTitle: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: CustomColors.light,
    marginBottom: moderateScale(4),
  },

  headerSubtitle: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.grayScale,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(100),
  },

  emptyText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(16),
    color: CustomColors.grayScale,
    marginTop: Spacing.md,
  },

  // Loading Overlay (Deep Link)
  deepLinkLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 19, 24, 0.85)', // Fundo escuro semitransparente
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  
  deepLinkLoadingText: {
    fontFamily: CustomFonts.inter,
    fontSize: moderateScale(14),
    color: CustomColors.primary,
    marginTop: Spacing.md,
    fontWeight: 'bold',
  },

  // Floating Action Bar para seleção
  floatingActionBar: {
    position: 'absolute',
    bottom: Spacing.sm, // Eleva acima das abas (tabs)
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
    // Removido o background, padding e shadows para deixar apenas os botões flutuando
  }
});

export default function StylesRoute() { return null; }