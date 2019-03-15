import { Injectable } from '@angular/core';
import { Character, Char } from './models/models';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private baseUrl = 'https://esi.evetech.net/latest';
  private imageServer = 'https://imageserver.eveonline.com/Character/';
  private ipc: IpcRenderer;
  public chars: Char[] = [];

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

  getCharInfo = (pid: string): Observable<Char> =>
    this.http.get<Character>(`${this.baseUrl}/characters/${pid}/`)
      .pipe(
        catchError(error => of(undefined)),
        map(char => ({
          id: pid,
          data: char,
          profile: `${this.imageServer}${pid}_256.jpg`
        } as Char))
      )

  getFiles = (): Observable<string[]> => {
    return Observable.create((observer: Observer<string[]>) => {
      this.ipc.once('getFilesResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getFiles');
    });
  }

  copyCharSettings = (main: string, chars: string[]): Observable<void> => {
    return Observable.create((observer: Observer<void>) => {
      this.ipc.once('copyCharResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('copyCharSettings', [main, ...chars]);
    });
  }

  unselectAll = () => {
    this.chars.forEach((char) => char.checked = false);
  }

  async writeFile() {
    return new Promise<any>((resolve, reject) => {
      this.ipc.once('writeResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('writeFile', ['potato']);
    })
  }

  async getFileContent() {
    return new Promise<string>((resolve, reject) => {
      this.ipc.once('getFileResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('getFileContent');
    });
  }
}
