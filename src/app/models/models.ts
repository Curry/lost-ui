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
// tslint:enable variable-name

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

export type TypeValue = 'char' | 'user';

export const cReg = /(char)/;
export const aReg = /(user)/;
