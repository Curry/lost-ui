import { AppService } from './../app.service';
import { Component, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { Char } from '../models/models';
import { ActivatedRoute, } from '@angular/router';
import { tap, delay } from 'rxjs/operators';

@Component({
  selector: 'app-char-copy',
  templateUrl: './char-copy.component.html',
  styleUrls: ['./char-copy.component.scss']
})
export class CharCopyComponent implements OnInit {
  primary: string;
  done: boolean;
  selectAll: boolean;

  constructor(private service: AppService, private zone: NgZone, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
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
    this.route.queryParams.subscribe(params => {
      this.getCharSettings(params.refresh || false);
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

  getCharSettings = (refresh: boolean = false) => {
    this.service.getCharProfile(refresh)
      .subscribe((val: Char[]) => {
        this.zone.run(() => {
          this.chars = val;
          this.primary = '';
        });
      });
  }

  copyCharSettings = () => {
    this.service
      .copyCharSettings(
        this.chars.find(char => char.data.name === this.primary).id,
        this.chars.filter(char => char.checked).map(char => char.id)
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
      this.done = true;
      this.cdr.detectChanges();
    });
  }
}
