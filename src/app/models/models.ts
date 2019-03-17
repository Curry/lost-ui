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


export class Char {
  id: string;
  data: Character;
  profile: string;
  checked: boolean;
  disabled: boolean;
}

export class Acc {
  checked: boolean;
  disabled: boolean;
  id: string;
  linkChars: Char[];
}

export class Data {
  id: string;
  name: string;
  checked: boolean;
  disabled: boolean;
  img: string;
  type?: number;
}

export enum CopyType {
  CH = 'char',
  AC = 'user'
}
