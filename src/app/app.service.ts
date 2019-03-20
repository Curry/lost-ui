import { IpcService } from './ipc.service';
import { Injectable } from '@angular/core';
import { Character, TypeValue, Data, Backup, FileData, RawData } from './models/models';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, concatMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private baseUrl = 'https://esi.evetech.net/latest';
  private imageServer = 'https://imageserver.eveonline.com/Character/';
  public path: string;
  public type: TypeValue;
  public selectAllChar: boolean;
  public selectAllAcc: boolean;
  public data: Data[];
  public primaryChar: string;
  public primaryAcc: string;

  constructor(private http: HttpClient, private ipc: IpcService) {
    this.data = [];
    this.selectAllChar = false;
    this.selectAllAcc = false;
    this.type = 'char';
  }

  public getAllData = (def: boolean = false) =>
    (def ? this.navigateDefault() : of(this.path)).pipe(
      tap(path => (this.path = path)),
      concatMap(() => this.getData())
    )

  public copySettings = (main: string, vals: string[]): Observable<void> =>
    this.ipc.copySettings(this.type, main, vals)

  public resetDir = () => this.ipc.resetDir().pipe(concatMap(() => this.getFiles(/([a-z]{1})(.*)(tq|sisi)/)));

  public setConf = (dir: string) => this.ipc.setConf(dir);

  public setDrive = (dir: string) => this.ipc.setDrive(dir).pipe(concatMap(() => this.getFiles(/(settings)/)));

  public getBackups = (): Observable<Backup[]> =>
    this.ipc.getBackups().pipe(
      map(vals => vals.filter(val => /([a-z]{4})_([0-9]{8})-([0-9]{6}).zip/.test(val))),
      map(vals => vals.map(this.decodeDate))
    )

  public getBackupInfo = (file: string): Observable<Data[]> =>
    this.ipc.getBackupInfo(file).pipe(concatMap(this.getData))

  public restoreBackup = (zFile: string) => this.ipc.restoreBackup(zFile);

  public getImports = () => this.ipc.getImports().pipe(concatMap(this.getData));

  public importAll = (files: RawData[]) => this.ipc.importAll(files);

  private getData = (files?: FileData[]): Observable<Data[]> =>
    (files ? of(files) : this.ipc.getDataFiles()).pipe(
      concatMap(fileData => forkJoin(this.getInfo(fileData))),
      map(data => data.sort((a, b) => a.name.localeCompare(b.name)))
    )

  private navigateDefault = () =>
    this.ipc.resetDir().pipe(
      concatMap(() => this.getFiles(/([a-z]{1})(.*)(tq)/)),
      map(files => files[0]),
      concatMap(this.ipc.setDrive),
      concatMap(() => this.getFiles(/(settings)/)),
      map(files => files[0]),
      concatMap(this.ipc.setConf)
    )

  private charInfo = (charData: FileData): Observable<Data> => {
    const existingChar = this.data.find(val => val.id === charData.id);
    return existingChar
      ? of(existingChar)
      : this.http
        .get<Character>(`${this.baseUrl}/characters/${charData.id}/`)
        .pipe(map(char => new Data(charData, char.name, `${this.imageServer}${charData.id}_128.jpg`)));
  }

  private accInfo = (accData: FileData): Observable<Data> => {
    const existingAcc = this.data.find(val => val.id === accData.id);
    return existingAcc
      ? of(existingAcc)
      : of(new Data(accData));
  }

  private getFiles = (regex: RegExp): Observable<string[]> =>
    this.ipc.getFiles().pipe(map(files => files.filter(file => regex.test(file))))

  private getInfo = (files: FileData[]): Observable<Data>[] =>
    files.map(file => (file.type === 0 ? this.charInfo(file) : this.accInfo(file)))

  private decodeDate = (fileName: string): Backup => {
    let finalString: string;
    const dateArray = fileName.substring(5).split('-');
    const date = dateArray[0];
    const time = dateArray[1];
    finalString = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
    finalString += `T${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(4, 6)}Z`;
    return {
      file: fileName,
      date: new Date(finalString)
    } as Backup;
  }
}
