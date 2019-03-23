import { Select, Data } from './../models/models';
import { Component, OnInit, NgZone } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { SelectComponent } from '../select/select.component';
import { tap, map, concatMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss']
})
export class LinkComponent implements OnInit {
  arr: Data[];
  selectedAccs: Select[];
  ready: boolean;
  constructor(
    private service: AppService,
    private router: Router,
    private zone: NgZone,
    private dialogRef: MatDialogRef<SelectComponent>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.arr = [];
  }

  public get linked() {
    return this.service.linkedAccs.filter(x => x.charIds.length > 0);
  }

  public get data() {
    const filtLinked: string[] = [].concat.apply([], this.service.linkedAccs.map(acc => acc.charIds));
    return this.service.data.filter(val => val.type === 0 && !filtLinked.some(char => char === val.id));
  }

  ngOnInit() {
    this.ready = false;
    this.service.getLinkedAccounts().subscribe(() => {}, () => {}, () => {
      this.ready = true;
    });
  }

  names = (ids: string[]) => {
    const name = ids.map(id => this.service.data.find(val => val.id === id)).filter(x => x);
    return name.map(data => data.name);
  }

  getUniqueInputs = () => Array.from(new Set(this.arr.filter(x => x).map(val => val.id)));

  clearLinked = () => {
    this.ready = false;
    forkJoin(this.selectedAccs.map(acc => this.service.setLinkedAccount(acc.accId, [])))
      .pipe(map(this.service.getLinkedAccounts))
      .subscribe(() => {
        this.zone.run(() => {
          this.router.navigate(['']);
          this.dialogRef.close();
        });
      });
  }

  findAccount = () => {
    this.ready = false;
    this.service.getLatestAccount()
      .pipe(
        tap(link => this.service.data.find(val => val.id === link).linkedChars = this.getUniqueInputs()),
        concatMap(link => this.service.setLinkedAccount(link, this.getUniqueInputs())),
        concatMap(this.service.getLinkedAccounts)
      )
      .subscribe(() => {
        this.zone.run(() => {
          this.router.navigate(['']);
          this.dialogRef.close();
        });
      });
  }
}
