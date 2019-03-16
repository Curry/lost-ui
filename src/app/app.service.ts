import { Injectable } from '@angular/core';
import { Character, Char, Acc } from './models/models';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer, of, forkJoin } from 'rxjs';
import { catchError, map, exhaustMap, publishReplay, refCount } from 'rxjs/operators';
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
  public selected = false;
  public path: string;
  public chars: Char[];
  public accs: Acc[];

  constructor(public http: HttpClient) {
    if ((window as any).require) {
      try {
        this.ipc = (window as any).require('electron').ipcRenderer;
      } catch (error) {
        throw error;
      }
    } else {
      console.warn('Could not load electron ipc');
    }
    this.chars = [];
  }

  public copyCharSettings = (main: string, chars: string[]): Observable<void> => {
    return new Observable((observer: Observer<void>) => {
      this.ipc.once('copyCharResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('copyCharSettings', [main, ...chars]);
    });
  }

  public copyAccSettings = (main: string, accs: string[]): Observable<void> => {
    return new Observable((observer: Observer<void>) => {
      this.ipc.once('copyAccResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('copyAccSettings', [main, ...accs]);
    });
  }

  public getPossibleFiles = (regex: RegExp): Observable<string[]> =>
    this.getFiles().pipe(map(files => files.filter(file => regex.test(file))))

  public getCharProfile = (refresh: boolean): Observable<Char[]> =>
    this.charObs && !refresh
      ? this.charObs
      : (this.charObs = this.getFiles().pipe(
        map(files =>
          files.filter(file => /(core_char_)([0-9]+)/.test(file)).map(val => val.split('_')[2].split('.')[0])
        ),
        exhaustMap(files => forkJoin(files.map(this.getCharInfo))),
        map(chars => chars.filter(val => val.data)),
        map(chars => chars.sort((a, b) => a.data.name.localeCompare(b.data.name))),
        publishReplay(1),
        refCount()
      ))

  public getAccProfile = (refresh: boolean) =>
    this.accObs && !refresh
      ? this.accObs
      : ((this.accObs = this.getFiles().pipe(
        map(files =>
          files.filter(file => /(core_user_)([0-9]+)/.test(file)).map(val => val.split('_')[2].split('.')[0])
        ),
        map(accs =>
          accs.map(
            acc =>
              ({
                disabled: true,
                checked: false,
                id: acc
              } as Acc)
          )
        ),
        publishReplay(1),
        refCount()
      )))

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

  private getFiles = (): Observable<string[]> => {
    return new Observable((observer: Observer<string[]>) => {
      this.ipc.once('getFilesResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getFiles');
    });
  }

  private getFileContent = () => {
    return new Observable((observer: Observer<string>) => {
      this.ipc.once('getFileResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getFileContent');
    });
  }

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
}
