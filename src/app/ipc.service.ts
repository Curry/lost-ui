import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { IpcRenderer } from 'electron';
import { TypeValue, FileData, RawData, Select } from './models/models';

@Injectable({
  providedIn: 'root'
})
export class IpcService {
  private ipc: IpcRenderer;
  private response = 'Response';

  constructor() {
    this.ipc = (window as any).require('electron').ipcRenderer;
  }

  public copyData = (type: TypeValue, main: string, vals: string[]): Observable<void> =>
    this.generateObservable('copyData', [type, main, ...vals])

  public copyBoth = (sourceChar: string, sourceAcc: string, destChars: string[], destAccs: string[]): Observable<void> =>
    this.generateObservable('copyBoth', [sourceChar, sourceAcc, destChars, destAccs])

  public getDrives = (): Observable<void> => this.generateObservable('resetToBaseDir');

  public selectDrive = (dir: string): Observable<void> => this.generateObservable('selectDrive', dir);

  public selectProfile = (dir: string): Observable<string> => this.generateObservable('selectProfile', dir);

  public getBackups = (): Observable<string[]> => this.generateObservable('getBackups');

  public getBackupInfo = (file: string): Observable<FileData[]> => this.generateObservable('getBackupInfo', file);

  public restoreBackup = (file: string): Observable<void> => this.generateObservable('restoreBackup', file);

  public getImports = (): Observable<FileData[]> => this.generateObservable('getImports');

  public importData = (vals: RawData[]): Observable<void> => this.generateObservable('importData', vals);

  public getFiles = (): Observable<string[]> => this.generateObservable('getFiles');

  public getDataFiles = (): Observable<FileData[]> => this.generateObservable('getDataFiles');

  public getLatestAccount = (): Observable<string> => this.generateObservable('getLatestAccount');

  public setLinkedAccount = (acc: string, chars: string[]): Observable<void> =>
    this.generateObservable('setLinkedAccount', [acc, ...chars])

  public getLinkedAccounts = (): Observable<Select[]> => this.generateObservable('getLinkedAccounts');

  private generateObservable = <T, S>(command: string, args?: T) =>
    new Observable((observer: Observer<S>) => {
      this.ipc.once(`${command}${this.response}`, (event: any, arg: S) => {
        observer.next(arg);
        observer.complete();
      });
      this.ipc.send(command, args);
    })
}
