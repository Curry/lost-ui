import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { IpcRenderer } from 'electron';
import { TypeValue, FileData, RawData } from './models/models';

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

  public copySettings = (type: TypeValue, main: string, vals: string[]): Observable<void> =>
    this.generateObservable('copy', [type, main, ...vals])

  public importAll = (vals: RawData[]): Observable<void> => this.generateObservable('importAll', vals);

  public getFiles = (): Observable<string[]> => this.generateObservable('getFiles');

  public getDataFiles = (): Observable<FileData[]> => this.generateObservable('getDataFiles');

  public restoreBackup = (file: string): Observable<void> => this.generateObservable('restoreBackup', file);

  public getImports = (): Observable<FileData[]> => this.generateObservable('getImports');

  public getBackups = (): Observable<string[]> => this.generateObservable('getBackups');

  public getBackupInfo = (file: string): Observable<FileData[]> => this.generateObservable('getBackupInfo', file);

  private generateObservable = <T, S>(command: string, args?: T) =>
    new Observable((observer: Observer<S>) => {
      this.ipc.once(`${command}${this.response}`, (event: any, arg: S) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send(command, args);
    })
}
