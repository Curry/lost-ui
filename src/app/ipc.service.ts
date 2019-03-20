import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { IpcRenderer } from 'electron';
import { Base, CopyType } from './models/models';

@Injectable({
  providedIn: 'root'
})
export class IpcService {
  private ipc: IpcRenderer;
  private response = 'Response';

  constructor() {
    this.ipc = (window as any).require('electron').ipcRenderer;
  }

  // public resetDir = (): Observable<void> => this.generateObservable('resetDir');

  public resetDir = (): Observable<void> =>
    new Observable(observer => {
      this.ipc.once('resetDirResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('resetDir');
    })

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

  public copySettings = (type: CopyType, main: string, vals: string[]): Observable<void> =>
    new Observable(observer => {
      this.ipc.once('copyResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('copySettings', [type === CopyType.CH ? 'char' : 'user', main, ...vals]);
    })

  public importAll = (vals: Base[]): Observable<void> =>
    new Observable(observer => {
      this.ipc.once('importAllResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('importAll', vals);
    })

  public getFiles = (): Observable<string[]> =>
    new Observable((observer: Observer<string[]>) => {
      this.ipc.once('getFilesResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getFiles');
    })

  public createProfile = (profile: string): Observable<void> =>
    new Observable(observer => {
      this.ipc.once('createProfileResponse', (event, arg) => {
        observer.next();
        observer.complete();
      });
      this.ipc.send('createProfile');
    })

  public restoreBackup = (file: string) =>
    new Observable((observer: Observer<void>) => {
      this.ipc.once('restoreBackupResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('restoreBackup', file);
    })

  public getImports = () =>
    new Observable((observer: Observer<string[]>) => {
      this.ipc.once('getImportsResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getImports');
    })

  public getBackups = (): Observable<string[]> =>
    new Observable((observer: Observer<string[]>) => {
      this.ipc.once('getBackupsResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getBackups');
    })

  public getBackupInfo = (file: string): Observable<string[]> =>
    new Observable((observer: Observer<string[]>) => {
      this.ipc.once('getBackupInfoResponse', (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send('getBackupInfo', file);
    })


  private generateObservable = <T extends {} | void>(command: string, args?: T) =>
    new Observable((observer: Observer<T>) => {
      this.ipc.once(`${command}${this.response}`, (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send(command, args);
    })
}
