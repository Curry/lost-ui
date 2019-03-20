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

  public resetDir = (): Observable<void> => this.generateObservable('resetDir');

  public setDrive = (dir: string): Observable<void> => this.generateObservable('setDrive', dir);

  public setConf = (dir: string): Observable<string> => this.generateObservable('setConf', dir);

  public copySettings = (type: CopyType, main: string, vals: string[]): Observable<void> =>
    this.generateObservable('copy', [type === CopyType.CH ? 'char' : 'user', main, ...vals])

  public importAll = (vals: Base[]): Observable<void> => this.generateObservable('importAll', vals);

  public getFiles = (): Observable<string[]> => this.generateObservable('getFiles');

  public restoreBackup = (file: string): Observable<void> => this.generateObservable('restoreBackup', file);

  public getImports = (): Observable<string[]> => this.generateObservable('getImports');

  public getBackups = (): Observable<string[]> => this.generateObservable('getBackups');

  public getBackupInfo = (file: string): Observable<string[]> => this.generateObservable('getBackupInfo', file);

  private generateObservable = <T, S>(command: string, args?: T) =>
    new Observable((observer: Observer<S>) => {
      this.ipc.once(`${command}${this.response}`, (event, arg) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send(command, args);
    })
}
