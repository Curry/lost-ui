import { Injectable } from '@angular/core';
import { Character, CopyType, Data, Backup } from './models/models';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer, forkJoin, of } from 'rxjs';
import { map, concatMap, tap, switchMap, exhaustMap, mergeMap } from 'rxjs/operators';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private baseUrl = 'https://esi.evetech.net/latest';
  private imageServer = 'https://imageserver.eveonline.com/Character/';
  private ipc: IpcRenderer;
  public path: string;
  public type: CopyType;
  public selectAllChar: boolean;
  public selectAllAcc: boolean;
  public charData: Data[];
  public accData: Data[];
  public data: Data[];
  public backups: Backup[];
  public primaryChar: string;
  public primaryAcc: string;

  constructor(public http: HttpClient) {
    this.ipc = (window as any).require('electron').ipcRenderer;
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
    this.resetDir()
      .pipe(
        switchMap(() => this.getFiles(/([a-z]{1})(.*)(tq)/)),
        map(files => files[0]),
        tap((file) => {
          this.path = file;
        }),
        concatMap(this.setDrive),
        switchMap(() => this.getFiles(/(settings)/)),
        map(files => files[0]),
        tap((file) => {
          this.path += `/${file}`;
        }),
        switchMap(this.setConf)
      )

  public resetDir = (): Observable<void> => {
    return new Observable(observer => {
      this.ipc.once('resetDirResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('resetDir');
    });
  }

  public setDrive = (dir: string): Observable<void> =>
    new Observable(observer => {
      this.ipc.once('setDriveResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('setDrive', dir);
    })

  public setConf = (dir: string): Observable<void> =>
    new Observable(observer => {
      this.ipc.once('setConfResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('setConf', dir);
    })

  public copySettings = (main: string, vals: string[]): Observable<void> => {
    return new Observable(observer => {
      this.ipc.once('copyResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('copySettings', [this.type === CopyType.CH ? 'char' : 'user', main, ...vals]);
    });
  }

  public importAll = (vals: { type: number; id: string; }[]): Observable<void> => {
    return new Observable(observer => {
      this.ipc.once('importAllResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('importAll', vals);
    });
  }

  public getFiles = (regex: RegExp): Observable<string[]> => {
    return new Observable((observer: Observer<string[]>) => {
      this.ipc.once('getFilesResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getFiles');
    }).pipe(map(files => files.filter(file => regex.test(file))));
  }

  public restoreBackup = (file: string) => {
    return new Observable((observer: Observer<void>) => {
      this.ipc.once('restoreBackupResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('restoreBackup', file);
    });
  }

  public getImports = () => {
    return new Observable((observer: Observer<string[]>) => {
      this.ipc.once('getImportsResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getImports');
    }).pipe(mergeMap(this.getAllData));
  }

  public getBackups = (): Observable<Backup[]> => {
    return new Observable((observer: Observer<string[]>) => {
      this.ipc.once('getBackupsResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getBackups');
    }).pipe(
      map(vals => vals.filter(val => /([a-z]{4})_([0-9]{8})-([0-9]{6}).zip/.test(val))),
      map(vals => vals.map(this.parseString))
    );
  }

  public getBackupInfo = (file: string): Observable<Data[]> => {
    return new Observable((observer: Observer<string[]>) => {
      this.ipc.once('getBackupInfoResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getBackupInfo', file);
    }).pipe(
      map(this.getIdsFromFile),
      map(this.getDataFromId)
    );
  }

  private getAccInfo = (accs: string[]): Observable<Data[]> =>
    of(accs.map(
      acc =>
        ({
          id: acc,
          name: acc,
          disabled: true,
          checked: false,
          type: 1
        } as Data)
    ))

  private getCharInfo = (pids: string[]): Observable<Data[]> =>
    forkJoin(pids.map((pid) => this.http.get<Character>(`${this.baseUrl}/characters/${pid}/`).pipe(
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
      ))))

  private getIds = ([a, b]: [string[], string[]]) => [this.getIdsFromFile(a), this.getIdsFromFile(b)];

  private getIdsFromFile = (files: string[]) => files.map(val => val.split('_')[2].split('.')[0]);

  private getInfo = ([a, b]: [string[], string[]]) => forkJoin(this.getCharInfo(a), this.getAccInfo(b));

  private getDataFromId = (files: string[]) => files.map(file => [...this.charData, ...this.accData].find((val) => val.id === file));

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
