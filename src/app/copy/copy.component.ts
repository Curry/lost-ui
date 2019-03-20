import { Data, CopyType, Copy } from './../models/models';
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
export class CopyComponent implements OnInit, Copy {
  constructor(private service: AppService, private zone: NgZone, private route: ActivatedRoute, private cdr: ChangeDetectorRef,
              private snack: MatSnackBar) { }

  public get data() {
    return this.type === CopyType.CH ? this.service.charData : this.service.accData;
  }

  public get primary() {
    return this.type === CopyType.CH ? this.service.primaryChar : this.service.primaryAcc;
  }

  public set primary(val: string) {
    if (this.type === CopyType.CH) {
      this.service.primaryChar = val;
    } else {
      this.service.primaryAcc = val;
    }
  }

  public get selectAll() {
    return this.type === CopyType.CH ? this.service.selectAllChar : this.service.selectAllAcc;
  }

  public set selectAll(val: boolean) {
    if (this.type === CopyType.CH) {
      this.service.selectAllChar = val;
    } else {
      this.service.selectAllAcc = val;
    }
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
      if (params.initial) {
        this.getSettings(true);
      } else {
        this.refresh();
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
    this.getSettingsV2();
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
        this.service.importChars().subscribe((val) => console.log(val));
      });
    });
  }

  getSettingsV2 = (def: boolean = false) => {
    const setObs = def ? this.service.navigateDefault().pipe(
      concatMap(this.service.getAllDataV2),
    ) : this.service.getAllDataV2();

    setObs.subscribe(([chars, accs]) => {
      this.zone.run(() => {
        this.service.charDataV2 = chars;
        this.service.accDataV2 = accs;
      });
    });
  }

  copySettings = () => {
    this.service.copySettings(
      this.data.find(val => val.name === this.primary).id,
      this.data.filter(val => val.checked).map(char => char.id)
    )
    .pipe(tap(this.run))
    .subscribe(() => {
      this.zone.run(() => {
        this.snack.open(`${this.typeName} Settings copied!`, 'Dismiss', {
          duration: 5000
        });
      });
    });
  }

  toggle = () => {
    this.selectAll = !this.selectAll;
    this.data.forEach(val => {
      if (!val.disabled) {
        val.checked = this.selectAll;
      }
    });
  }

  run = () => {
    this.zone.run(() => {
      this.data.forEach(val => (val.checked = false));
      this.cdr.detectChanges();
    });
  }

}
