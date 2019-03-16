import { Injectable } from '@angular/core';
import { Character, Char } from './models/models';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer, of, forkJoin } from 'rxjs';
import {
  catchError,
  map,
  exhaustMap,
  publishReplay,
  refCount,
  switchMap,
  concat,
  concatMap,
  tap
} from 'rxjs/operators';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private baseUrl = 'https://esi.evetech.net/latest';
  private imageServer = 'https://imageserver.eveonline.com/Character/';
  private ipc: IpcRenderer;
  private charObs: Observable<Char[]>;
  public selected = false;
  private tempAcc = ['2113388487', '2113585107'];

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

  public getPossibleFiles = (regex: RegExp): Observable<string[]> =>
    this.getFiles().pipe(map(files => files.filter(file => regex.test(file))))

  public getCharProfile = (refresh: boolean): Observable<Char[]> =>
    this.charObs && !refresh ? this.charObs : (this.charObs = this.getFiles()
      .pipe(
        map(files =>
          files.filter(file => /(core_char_)([0-9]+)/.test(file)).map(val => val.split('_')[2].split('.')[0])
        ),
        exhaustMap(files => forkJoin(files.map(this.getCharInfo))),
        map(chars => chars.filter(val => val.data)),
        publishReplay(1),
        refCount()
      ))

  private getCharInfo = (pid: string): Observable<Char> =>
    this.http.get<Character>(`${this.baseUrl}/characters/${pid}/`).pipe(
      map(
        char =>
          ({
            id: pid,
            data: char,
            profile: `${this.imageServer}${pid}_256.jpg`
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

  public getOS = (): Observable<string> => {
    return new Observable((observer: Observer<string>) => {
      this.ipc.once('getOSResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getOS');
    });
    // return of('win32');
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
