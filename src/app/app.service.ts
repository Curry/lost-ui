import { Injectable } from '@angular/core';
import { Character, Char, Acc, CopyType, Data } from './models/models';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer, of, forkJoin, concat, merge } from 'rxjs';
import { catchError, map, exhaustMap, publishReplay, refCount, concatMap, tap, switchMap } from 'rxjs/operators';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private baseUrl = 'https://esi.evetech.net/latest';
  private imageServer = 'https://imageserver.eveonline.com/Character/';
  private ipc: IpcRenderer;
  private charObs: Observable<Char[]>;
  private accObs: Observable<Acc[]>;
  private dataObs: Observable<Data[]>;
  public selected = false;
  public path: string;
  public chars: Char[];
  public accs: Acc[];
  public data: Data[];
  public type: CopyType = CopyType.CH;


  public charData: Data[];
  public accData: Data[];

  constructor(public http: HttpClient) {
    this.ipc = (window as any).require('electron').ipcRenderer;
    this.chars = [];
    this.data = [];
    this.charData = [];
    this.accData = [];
  }

  public getCharProfile = (refresh: boolean): Observable<Char[]> =>
    this.charObs && !refresh
      ? this.charObs
      : (this.charObs = this.getFiles(/(core_char_)([0-9]+)/).pipe(
        map(this.getIdsFromFile),
        exhaustMap(files => forkJoin(files.map(this.getCharInfo))),
        map(chars => chars.filter(val => val.data)),
        map(chars => chars.sort((a, b) => a.data.name.localeCompare(b.data.name))),
        publishReplay(1),
        refCount()
      ))

  public getAccProfile = (refresh: boolean) =>
    this.accObs && !refresh
      ? this.accObs
      : (this.accObs = this.getFiles(/(core_user_)([0-9]+)/).pipe(
        map(this.getIdsFromFile),
        map(this.getAccInfo),
        publishReplay(1),
        refCount()
      ))


  public getData = (refresh: boolean, type: CopyType): Observable<Data[]> => {
    if (this.dataObs && !refresh) {
      if (type === CopyType.CH && this.charData) {
        return of(this.charData);
      } else if (type === CopyType.AC && this.accData) {
        return of(this.accData);
      }
    }
    const idObs: Observable<string[]> = this.getFiles(new RegExp(`(core_${type}_)([0-9]+)`)).pipe(map(this.getIdsFromFile));
    if (type === CopyType.CH) {
      this.dataObs = idObs.pipe(
        concatMap(files => forkJoin(files.map(this.getCharInfoV2)))
      );
    } else {
      this.dataObs = idObs.pipe(
        map(this.getAccInfoV2)
      );
    }
    return this.dataObs = this.dataObs.pipe(
      map(data => data.filter(val => val.name)),
      map(chars => chars.sort((a, b) => a.name.localeCompare(b.name))),
      publishReplay(1),
      refCount()
    );
  }

  public getAllData = (): Observable<Data[]> => {
    // if (this.data) {
    //   return of(this.data);
    // }
    const charObs: Observable<Data[]>  = this.getFiles(new RegExp(`(core_char_)([0-9]+)`))
      .pipe(
        map(this.getIdsFromFile),
        concatMap(files => forkJoin(files.map(this.getCharInfoV2)))
      );
    const accObs: Observable<Data[]>  = this.getFiles(new RegExp(`(core_user_)([0-9]+)`))
      .pipe(
        map(this.getIdsFromFile),
        map(this.getAccInfoV2)
      );

    return forkJoin(charObs, accObs).pipe(
      map(([a, b]) => [...a, ...b]),
      map(data => data.filter(val => val.name)),
      map(chars => chars.sort((a, b) => a.name.localeCompare(b.name))),
      publishReplay(1),
      refCount()
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

  private getIdsFromFile = (files: string[]) => files.map(val => val.split('_')[2].split('.')[0]);

  private getAccInfo = (accs: string[]) =>
    accs.map(
      acc =>
        ({
          disabled: true,
          checked: false,
          id: acc
        } as Acc)
    )

  private getAccInfoV2 = (accs: string[]) =>
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

  private getCharInfo = (pid: string): Observable<Char> =>
    this.http.get<Character>(`${this.baseUrl}/characters/${pid}/`).pipe(
      map(
        char =>
          ({
            id: pid,
            data: char,
            profile: `${this.imageServer}${pid}_256.jpg`,
            disabled: true,
            checked: false
          } as Char)
      ),
      catchError(() => of(undefined))
    )

  private getCharInfoV2 = (pid: string): Observable<Data> =>
    this.http.get<Character>(`${this.baseUrl}/characters/${pid}/`).pipe(
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
      )
    )
}
