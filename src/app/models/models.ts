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

export class LinkData {
  date: Date;
  fileName: string;
}
export class RawData {
  profileName: string;
  fileName: string;
}
export class FileData extends RawData {
  id: string;
  type: number;
}
export class Data extends FileData {
  name: string;
  img: string;
  linkedChars?: string[];
  checked: boolean;
  disabled: boolean;

  constructor(fileData: FileData, name?: string, img?: string) {
    super();
    this.profileName = fileData.profileName;
    this.fileName = fileData.fileName;
    this.id = fileData.id;
    this.type = fileData.type;
    this.name = name ? name : fileData.id;
    this.img = img;
    this.checked = false;
    this.disabled = true;
  }
}

export class Backup {
  file: string;
  date: Date;
}

export class Select {
  accId: string;
  charIds: string[];
}

export type TypeValue = 'char' | 'user';

export const cReg = /(char)/;
export const aReg = /(user)/;
