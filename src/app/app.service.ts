import { Injectable } from '@angular/core';
import { Character, CopyType, Data } from './models/models';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer, forkJoin, of } from 'rxjs';
import { map, concatMap, tap, switchMap, exhaustMap } from 'rxjs/operators';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private baseUrl = 'https://esi.evetech.net/latest';
  private imageServer = 'https://imageserver.eveonline.com/Character/';
  private ipc: IpcRenderer;
  public path: string;
  public type: CopyType = CopyType.CH;
  public charData: Data[];
  public accData: Data[];
  public primaryChar: string;
  public primaryAcc: string;

  constructor(public http: HttpClient) {
    this.ipc = (window as any).require('electron').ipcRenderer;
    this.charData = [];
    this.accData = [];
  }

  public getAllData = (): Observable<Data[]> => {
    const charObs: Observable<string[]> = this.getFiles(new RegExp(`(core_char_)([0-9]+)`));
    const accObs: Observable<string[]> = this.getFiles(new RegExp(`(core_user_)([0-9]+)`));

    return forkJoin(charObs, accObs).pipe(
      map(this.getIds),
      exhaustMap(this.getInfo),
      map(([a, b]) => [...a, ...b]),
      map(data => data.filter(val => val.name)),
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

  public setDrive = (dir: string) =>
    new Observable(observer => {
      this.ipc.once('setDriveResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('setDrive', dir);
    })

  public setConf = (dir: string) =>
    new Observable(observer => {
      this.ipc.once('setConfResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('setConf', dir);
    })

  public copySettings = (main: string, accs: string[]): Observable<void> => {
    return new Observable(observer => {
      this.ipc.once('copyResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('copySettings', [this.type === CopyType.CH ? 'char' : 'user', main, ...accs]);
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

  private getAccInfo = (accs: string[]) =>
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
            img: `${this.imageServer}${pid}_256.jpg`,
            disabled: true,
            checked: false,
            type: 0
          } as Data)
      ))))

  private getIds = ([a, b]: [string[], string[]]) => [this.getIdsFromFile(a), this.getIdsFromFile(b)];

  private getIdsFromFile = (files: string[]) => files.map(val => val.split('_')[2].split('.')[0]);

  private getInfo = ([a, b]: [string[], string[]]) => forkJoin(this.getCharInfo(a), this.getAccInfo(b));
}
