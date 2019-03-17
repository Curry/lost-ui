import { MatSnackBar } from '@angular/material/snack-bar';
import { AppService } from './../app.service';
import { Component, NgZone, OnInit, ChangeDetectorRef, OnChanges, OnDestroy } from '@angular/core';
import { Char, CopyType } from '../models/models';
import { ActivatedRoute, } from '@angular/router';
import { tap, delay, concatMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-char-copy',
  templateUrl: './char-copy.component.html',
  styleUrls: ['./char-copy.component.scss']
})
export class CharCopyComponent implements OnInit {
  primary: string;
  selectAll: boolean;
  navSub: Subscription;

  constructor(private service: AppService, private zone: NgZone, private route: ActivatedRoute, private cdr: ChangeDetectorRef,
              private snack: MatSnackBar) {
    this.chars = [];
  }

  public get chars() {
    return this.service.chars;
  }

  public set chars(chars: Char[]) {
    this.service.chars = chars;
  }

  public get charNames() {
    return this.chars.map(char => char.data.name);
  }

  public get numChecked() {
    return this.chars.reduce((acc, char) => (acc += char.checked ? 1 : 0), 0);
  }

  public get buttonDisabled() {
    return this.numChecked === 0;
  }

  ngOnInit() {
    this.navSub = this.route.queryParams.subscribe(params => {
      this.getCharSettings(params.refresh || false, params.default || false);
    });
  }

  disable = (value: string) => {
    this.chars.find((char) => char.data.name === value).disabled = true;
    this.chars
      .filter((char) => char.disabled && char.data.name !== value)
      .forEach((char) => char.disabled = false);
  }

  refresh = () => {
    this.chars = [];
    this.getCharSettings(true);
  }

  getCharSettings = (refresh: boolean, def: boolean = false) => {
    const gcsObs = def ? this.service.navigateDefault().pipe(
      concatMap(() => this.service.getCharProfile(true))
    ) : this.service.getCharProfile(refresh);

    gcsObs.subscribe((val: Char[]) => {
        this.zone.run(() => {
          this.chars = val;
          this.primary = '';
        });
      });
  }

  copyCharSettings = () => {
    this.service
      .copySettings(
        CopyType.CH,
        this.chars.find(char => char.data.name === this.primary).id,
        this.chars.filter(char => char.checked).map(char => char.id)
      )
      .pipe(tap(this.finalize))
      .subscribe(() => {
        this.zone.run(() => {
          this.snack.open('Character Settings copied!', 'Dismiss', {
            duration: 5000
          });
        });
      });
  }

  toggleSelect = () => {
    this.chars.forEach(char => {
      if (!char.disabled) {
        char.checked = !char.checked;
      }
    });
    this.selectAll = !this.selectAll;
  }

  finalize = () => {
    this.zone.run(() => {
      this.chars.forEach(char => (char.checked = false));
      this.cdr.detectChanges();
    });
  }
}
