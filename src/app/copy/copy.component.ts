import { Data, CopyType } from './../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../app.service';
import { concatMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss']
})
export class CopyComponent implements OnInit {
  primary: string;
  selectAll: boolean;

  constructor(private service: AppService, private zone: NgZone, private route: ActivatedRoute, private cdr: ChangeDetectorRef,
              private snack: MatSnackBar) { }

  public get data() {
    return this.type === CopyType.CH ? this.service.charData : this.service.accData;
  }

  public get names() {
    return this.data.map(val => val.name);
  }

  public get numChecked() {
    return this.data.reduce((acc, val) => (acc += val.checked ? 1 : 0), 0);
  }

  public get buttonDisabled() {
    return this.numChecked === 0;
  }

  public get type() {
    return this.service.type;
  }

  public get typeName() {
    return this.type === CopyType.CH ? 'Character' : 'Account';
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params.refresh) {
        this.refresh();
      } else {
        this.getSettings(true);
      }
    });
  }

  disable = (value: string) => {
    this.data.find((val) => val.name === value).disabled = true;
    this.data
      .filter((val) => val.disabled && val.name !== value)
      .forEach((val) => val.disabled = false);
  }

  refresh = () => {
    this.service.accData = [];
    this.service.charData = [];
    this.getSettings();
  }

  getSettings = (def: boolean = false) => {
    const setObs = def ? this.service.navigateDefault().pipe(
      concatMap(() => this.service.getAllData())
    ) : this.service.getAllData();

    setObs.subscribe((data: Data[]) => {
      this.zone.run(() => {
        data.forEach((val) => {
          (val.type === 0 ? this.service.charData : this.service.accData).push(val);
        });
        this.primary = '';
      });
    });
  }

  copySettings = (type: CopyType) => {
    this.service.copySettings(
      this.data.find(val => val.name === this.primary).id,
      this.data.filter(val => val.checked).map(char => char.id)
    )
    .pipe(tap(this.finalize))
    .subscribe(() => {
      this.zone.run(() => {
        this.snack.open(`${this.typeName} Settings copied!`, 'Dismiss', {
          duration: 5000
        });
      });
    });
  }

  toggleSelect = () => {
    this.data.forEach(val => {
      if (!val.disabled) {
        val.checked = !val.checked;
      }
    });
    this.selectAll = !this.selectAll;
  }

  finalize = () => {
    this.zone.run(() => {
      this.data.forEach(val => (val.checked = false));
      this.cdr.detectChanges();
    });
  }

}
