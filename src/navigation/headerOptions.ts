// Unified Apple-style header options for all navigators
import { Colors } from '../shared/theme';

export const DARK_HEADER = {
  headerStyle: { backgroundColor: Colors.surfaceBlack, height: 56 },
  headerTintColor: Colors.onDark,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 17, color: Colors.onDark },
  headerShadowVisible: false,
  headerStyleInterpolator: undefined,
  headerTitleAlign: 'center' as const,
  headerStatusBarHeight: 0,
};

export const LIGHT_HEADER = {
  headerStyle: { backgroundColor: Colors.canvas, height: 56 },
  headerTintColor: Colors.ink,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 17, color: Colors.ink },
  headerShadowVisible: false,
  headerTitleAlign: 'center' as const,
  headerStatusBarHeight: 0,
};
