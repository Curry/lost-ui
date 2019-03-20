import { IpcService } from './ipc.service';
import { Injectable } from '@angular/core';
import { Character, CopyType, Data, Backup, Base } from './models/models';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer, forkJoin, of } from 'rxjs';
import { map, concatMap, tap, switchMap, exhaustMap, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private baseUrl = 'https://esi.evetech.net/latest';
  private imageServer = 'https://imageserver.eveonline.com/Character/';
  public path: string;
  public type: CopyType;
  public selectAllChar: boolean;
  public selectAllAcc: boolean;
  public data: Data[];
  public backups: Backup[];
  public primaryChar: string;
  public primaryAcc: string;

  constructor(private http: HttpClient, private ipc: IpcService) {
    this.data = [];
    this.selectAllChar = false;
    this.selectAllAcc = false;
    this.type = CopyType.CH;
  }

  public getAllData = (files: string[] = undefined): Observable<Data[]> => {
    const cReg = /(core_char_)([0-9]+)/;
    const aReg = /(core_user_)([0-9]+)/;
    let charObs: Observable<string[]>;
    let accObs: Observable<string[]>;
    if (files) {
      charObs = of(files.filter(file => cReg.test(file)));
      accObs = of(files.filter(file => aReg.test(file)));
    } else {
      charObs = this.getFiles(cReg);
      accObs = this.getFiles(aReg);
    }

    return forkJoin(charObs, accObs).pipe(
      map(this.getIds),
      exhaustMap(this.getInfo),
      map(([a, b]) => [...a, ...b]),
      map(chars => chars.sort((a, b) => a.name.localeCompare(b.name)))
    );
  }

  public navigateDefault = () =>
    this.ipc.resetDir().pipe(
      switchMap(() => this.getFiles(/([a-z]{1})(.*)(tq)/)),
      map(files => files[0]),
      tap(file => {
        this.path = file;
      }),
      concatMap(this.ipc.setDrive),
      switchMap(() => this.getFiles(/(settings)/)),
      map(files => files[0]),
      tap(file => {
        this.path += `/${file}`;
      }),
      switchMap(this.ipc.setConf)
    )

  public getFiles = (regex: RegExp): Observable<string[]> =>
    this.ipc.getFiles().pipe(map(files => files.filter(file => regex.test(file))))

  public getImports = () => this.ipc.getImports().pipe(mergeMap(this.getAllData));

  public getBackups = (): Observable<Backup[]> =>
    this.ipc.getBackups().pipe(
      map(vals => vals.filter(val => /([a-z]{4})_([0-9]{8})-([0-9]{6}).zip/.test(val))),
      map(vals => vals.map(this.parseString))
    )

  public getBackupInfo = (file: string): Observable<Data[]> =>
    this.ipc.getBackupInfo(file).pipe(
      map(this.getIdsFromFile),
      map(this.getDataFromId)
    )

  public resetDir = () =>
    this.ipc.resetDir().pipe(
      concatMap(() => this.getFiles(/([a-z]{1})(.*)(tq|sisi)/))
    )

  public setConf = (dir: string) => this.ipc.setConf(dir);

  public setDrive = (dir: string) => this.ipc.setDrive(dir).pipe(concatMap(() => this.getFiles(/(settings)/)));

  public importAll = (files: Base[]) => this.ipc.importAll(files);

  public copySettings = (main: string, vals: string[]): Observable<void> => this.ipc.copySettings(this.type, main, vals);

  public restoreBackup = (zFile: string) => this.ipc.restoreBackup(zFile);

  private getAccInfo = (accs: string[]): Observable<Data[]> =>
    of(
      accs.map(
        acc =>
          ({
            id: acc,
            name: acc,
            disabled: true,
            checked: false,
            type: 1
          } as Data)
      )
    )

  private getCharInfo = (pids: string[]): Observable<Data[]> =>
    forkJoin(
      pids.map(pid =>
        this.http.get<Character>(`${this.baseUrl}/characters/${pid}/`).pipe(
          map(
            char =>
              ({
                id: pid,
                name: char ? char.name : undefined,
                img: `${this.imageServer}${pid}_128.jpg`,
                disabled: true,
                checked: false,
                type: 0
              } as Data)
          )
        )
      )
    )

  private getIds = ([a, b]: [string[], string[]]) => [this.getIdsFromFile(a), this.getIdsFromFile(b)];

  private getIdsFromFile = (files: string[]) => files.map(val => val.split('_')[2].split('.')[0]);

  private getInfo = ([a, b]: [string[], string[]]) => forkJoin(this.getCharInfo(a), this.getAccInfo(b));

  private getDataFromId = (files: string[]) => files.map(file => this.data.find(val => val.id === file));

  private parseString = (fileName: string): Backup => {
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
