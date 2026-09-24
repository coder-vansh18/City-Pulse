import { useCityStore } from '../store/useCityStore';

export function useTheme() {
  const theme = useCityStore((s) => s.theme);
  const toggleTheme = useCityStore((s) => s.toggleTheme);
  const setTheme = useCityStore((s) => s.setTheme);

  return { theme, toggleTheme, setTheme, isDark: theme === 'dark' };
}
