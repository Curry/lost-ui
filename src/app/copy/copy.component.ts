import { Data } from './../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../app.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss']
})
export class CopyComponent implements OnInit {
  both: boolean;
  constructor(private service: AppService, private zone: NgZone, private route: ActivatedRoute, private cdr: ChangeDetectorRef,
              private snack: MatSnackBar) {
                this.both = false;
              }

  public get data() {
    return this.service.data.filter((val) => val.type === (this.type === 'char' ? 0 : 1));
  }

  public set data(val: Data[]) {
    this.service.data = val;
  }

  public get primary() {
    return this.type === 'char' ? this.service.primaryChar : this.service.primaryAcc;
  }

  public set primary(val: string) {
    if (this.type === 'char') {
      this.service.primaryChar = val;
    } else {
      this.service.primaryAcc = val;
    }
  }

  public get selectAll() {
    return this.data.reduce((acc, curr) => acc += curr.checked ? 1 : 0, 0) === this.data.length - 1;
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
    return this.type === 'char' ? 'Character' : 'Account';
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.refresh(params.initial);
    });
  }

  disable = (value: string) => {
    this.data.find((val) => val.name === value).disabled = true;
    this.data.find((val) => val.name === value).checked = false;
    this.data
      .filter((val) => val.disabled && val.name !== value)
      .forEach((val) => val.disabled = false);
  }

  refresh = (def: boolean = false) => {
    this.data = [];
    this.service.updateData(def).subscribe((data: Data[]) => {
      this.zone.run(() => {
        this.data = data;
        this.primary = '';
      });
    }, () => {}, () => {
      this.zone.run(() => {});
    });
  }

  getKnownLinkedChars = (chars: string[]) =>
    (chars ? chars : [])
      .map(char => this.service.data.filter(val => val.type === 0).find(val => val.id === char))
      .filter(x => x)

  copySettings = () => {
    let copyObs: Observable<void>;
    const primaryChar = this.data.find(val => val.name === this.primary).id;
    const selectedChars = this.data.filter(val => val.checked).map(char => char.id);
    if (this.both && this.type === 'char') {
      const primaryAcc = this.service.linkedAccs.find(accs => accs.charIds.find(val => val === primaryChar) != null);
      let interpolatedAccs =
        selectedChars.map(char => this.service.linkedAccs.find(accs => accs.charIds.find(val => val === char) != null));
      if (primaryAcc && interpolatedAccs) {
        interpolatedAccs = interpolatedAccs.filter(acc => acc.accId !== primaryAcc.accId);
        if (interpolatedAccs.length > 0) {
          copyObs = this.service.copyBoth(
            primaryChar,
            primaryAcc.accId,
            selectedChars,
            interpolatedAccs.map(acc => acc.accId)
          );
        } else {
          copyObs = this.service.copyData(primaryChar, selectedChars);
        }
      } else {
        copyObs = this.service.copyData(primaryChar, selectedChars);
      }
    } else {
      copyObs = this.service.copyData(primaryChar, selectedChars);
    }


    copyObs.subscribe(() => {
      this.zone.run(() => {
        this.data.forEach(val => (val.checked = false));
        this.cdr.detectChanges();
        this.snack.open(`${this.typeName} Settings copied & Backup created!`, 'Dismiss', {
          duration: 10000
        });
      });
    });
  }

  toggle = () => {
    const selected = !this.selectAll;
    this.data.forEach(val => {
      if (!val.disabled) {
        val.checked = selected;
      }
    });
  }

}
