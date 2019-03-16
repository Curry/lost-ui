import { tap, delay } from 'rxjs/operators';
import { AppService } from './../app.service';
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Acc } from '../models/models';

@Component({
  selector: 'app-acc-copy',
  templateUrl: './acc-copy.component.html',
  styleUrls: ['./acc-copy.component.scss']
})
export class AccCopyComponent implements OnInit {
  primary: string;
  done: boolean;
  selectAll: boolean;

  constructor(private service: AppService, private zone: NgZone, private cdr: ChangeDetectorRef) {
    this.accs = [];
  }

  public get accs() {
    return this.service.accs;
  }

  public set accs(accs: Acc[]) {
    this.service.accs = accs;
  }

  public get numChecked() {
    return this.accs.reduce((total, acc) => (total += acc.checked ? 1 : 0), 0)
  }

  public get buttonDisabled() {
    return this.numChecked === 0;
  }

  ngOnInit() {
    this.getAccSettings();
  }

  disable = (value: string) => {
    this.accs.find((acc) => acc.id === value).disabled = true;
    this.accs
      .filter((acc) => acc.disabled && acc.id !== value)
      .forEach((acc) => acc.disabled = false);
  }

  refresh = () => {
    this.accs = [];
    this.getAccSettings(true);
  }

  getAccSettings = (refresh: boolean = false) => {
    this.service.getAccProfile(refresh)
      .subscribe((accs) => {
        this.zone.run(() => {
          this.accs = accs;
        });
      });
  }

  copyAccSettings = () => {
    this.service
    .copyAccSettings(
      this.accs.find(acc => acc.id === this.primary).id,
      this.accs.filter(acc => acc.checked).map(acc => acc.id)
    )
    .pipe(
      tap(this.finalize),
      delay(10000)
    )
    .subscribe(() => {
      this.zone.run(() => {
        this.done = false;
      });
    });
  }

  toggleSelect = () => {
    this.accs.forEach(acc => {
      if (!acc.disabled) {
        acc.checked = !acc.checked;
      }
    });
    this.selectAll = !this.selectAll;
  }

  finalize = () => {
    this.zone.run(() => {
      this.accs.forEach(char => (char.checked = false));
      this.done = true;
      this.cdr.detectChanges();
    });
  }

}
