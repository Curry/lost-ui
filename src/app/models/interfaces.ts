export interface Copy {
  type: string;
  disable: (value: string) => void;
  refresh: () => void;
  getSettings: (refresh: boolean, def: boolean) => void;
  copySettings: () => void;
  toggle: () => void;
  run: () => void;
}
