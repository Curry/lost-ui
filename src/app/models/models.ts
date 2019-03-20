// tslint:disable variable-name
export class Character {
  ancestry_id: number;
  birthday: Date;
  bloodline_id: number;
  corporation_id: number;
  description: string;
  gender: string;
  name: string;
  race_id: number;
  security_status: number;
}

export class Base {
  type: number;
  id: string;
}

export class Data extends Base {
  name: string;
  checked: boolean;
  disabled: boolean;
  img: string;
  link?: Data;
}

export class Backup {
  file: string;
  date: Date;
}

export interface Copy {
  disable: (value: string) => void;
  refresh: () => void;
  copySettings: () => void;
  toggle: () => void;
}


export enum CopyType {
  CH = 'char',
  AC = 'user'
}
