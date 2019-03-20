import { Data } from './../models/models';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { AppService } from './../app.service';
import { Component, OnInit, NgZone } from '@angular/core';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  data: Data[];
  selectedChars: string[];
  selectedAccs: string[];
  ready: boolean;
  constructor(
    private service: AppService,
    private zone: NgZone,
    private router: Router,
    private dialogRef: MatDialogRef<ImportComponent>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.data = [];
    this.selectedAccs = [];
    this.selectedChars = [];
    this.ready = false;
  }

  public get hasNewChars() {
    return this.characters.length > 0;
  }

  public get hasNewAccs() {
    return this.accounts.length > 0;
  }

  public get characters() {
    return this.data.filter(val => val.type === 0);
  }

  public get accounts() {
    return this.data.filter(val => val.type === 1);
  }

  ngOnInit() {
    this.service.getImports().subscribe(vals => {
      this.data = vals.filter(val => this.service.data.map(char => char.name).indexOf(val.name) === -1);
      this.ready = true;
    });
  }

  import = () => {
    const response = [
      ...this.selectedChars.map(char => ({
        type: 0,
        id: char
      })),
      ...this.selectedAccs.map(acc => ({
        type: 1,
        id: acc
      }))
    ];
    this.service.importAll(response).subscribe(() => {
      this.zone.run(() => {
        this.router.navigate(['']);
        this.dialogRef.close();
      });
    });
  }

  importAll = () => {
    this.service
      .importAll(
        this.data.map(val => ({
          type: val.type,
          id: val.id
        }))
      )
      .subscribe(() => {
        this.zone.run(() => {
          this.router.navigate(['']);
          this.dialogRef.close();
        });
      });
  }
}
