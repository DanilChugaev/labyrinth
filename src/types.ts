export type PointDirection = 'top' | 'right' | 'bottom' | 'left';

export type GameState = 'play' | 'win';

export interface SettingsItem {
  id: string;
  label: string;
  title: string;
}
