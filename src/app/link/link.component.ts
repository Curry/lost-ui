import { Select, Data } from './../models/models';
import { Component, OnInit, NgZone } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { SelectComponent } from '../select/select.component';
import { tap, map, concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss']
})
export class LinkComponent implements OnInit {
  arr: Data[];
  constructor(
    private service: AppService,
    private router: Router,
    private zone: NgZone,
    private dialogRef: MatDialogRef<SelectComponent>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.arr = [];
  }

  public get data() {
    return this.service.data.filter(val => val.type === 0);
  }

  ngOnInit() {
  }

  getUniqueInputs = () => Array.from(new Set(this.arr.filter(x => x).map(val => val.id)));

  findAccount = () => {
    this.service.getLatestAccount()
    .pipe(
      tap(link => this.service.data.find(val => val.id === link).linkedChars = this.getUniqueInputs()),
      concatMap(link => this.service.setLinkedAccount(link, this.getUniqueInputs()))
    )
    .subscribe(link => {
      this.zone.run(() => {
        this.dialogRef.close();
      });
    });
  }
}
