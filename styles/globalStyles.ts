import { StyleSheet, Dimensions, Platform } from 'react-native';

// Получаем размеры экрана для адаптивности
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width > 768;

// Цветовая палитра
export const colors = {
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  accent: '#03A9F4',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  divider: '#E0E0E0',
  disabled: '#9E9E9E',
};

// Размеры шрифтов
export const fontSizes = {
  xs: isSmallScreen ? 10 : 12,
  sm: isSmallScreen ? 12 : 14,
  md: isSmallScreen ? 14 : 16,
  lg: isSmallScreen ? 16 : 18,
  xl: isSmallScreen ? 18 : 20,
  xxl: isSmallScreen ? 20 : 24,
  xxxl: isSmallScreen ? 24 : 30,
};

// Отступы
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Радиусы скругления
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Тени
export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
};

// Глобальные стили
export const globalStyles = StyleSheet.create({
  // Контейнеры
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  
  // Карточки
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardContent: {
    marginVertical: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  
  // Формы
  formContainer: {
    padding: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.xs,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  button: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Списки
  listItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listItemContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  listItemTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  listItemDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  
  // Загрузка
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  
  // Пустые состояния
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  
  // Типографика
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subheading: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bodyText: {
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: fontSizes.md * 1.5,
  },
  captionText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  
  // Разделители
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  
  // Чипы и бейджи
  chip: {
    borderRadius: borderRadius.round,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
  },
  
  // Сетка
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  col: {
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  col2: {
    width: '50%',
  },
  col3: {
    width: '33.33%',
  },
  col4: {
    width: '25%',
  },
  
  // Адаптивные стили для планшетов
  tabletContainer: {
    paddingHorizontal: isTablet ? spacing.xl : spacing.md,
  },
  tabletCard: {
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: isTablet ? 'center' : 'auto',
    width: isTablet ? '100%' : 'auto',
  },
});

export default {
  colors,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  globalStyles,
  isSmallScreen,
  isTablet,
};