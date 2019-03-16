import { AppService } from './../app.service';
import { Component, NgZone, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { Char } from '../models/models';

@Component({
  selector: 'app-char-copy',
  templateUrl: './char-copy.component.html',
  styleUrls: ['./char-copy.component.scss']
})
export class CharCopyComponent implements OnInit {
  primary: string;
  done: boolean;
  chars: Char[];
  constructor(private service: AppService, private zone: NgZone) {
    this.chars = [];
  }

  public get charNames() {
    return this.chars.map(char => char.data.name);
  }

  public get buttonDisabled() {
    return this.chars.reduce((acc, char) => (acc += char.checked ? 1 : 0), 0) === 0;
  }

  ngOnInit() {
    this.getCharSettings();
  }

  disable = (value: string) => {
    this.chars.find((char) => char.data.name === value).disabled = true;
    const oldCharDisabled = this.chars.filter((char) => char.disabled && char.data.name !== value);
    if (oldCharDisabled) {
      oldCharDisabled.forEach((char) => char.disabled = false);
    }
  }

  refresh = () => {
    this.chars = [];
    this.getCharSettings(true);
  }

  getCharSettings = (refresh: boolean = false) => {
    this.service.getCharProfile(refresh)
    .subscribe((val: Char[]) => {
      this.zone.run(() => {
        this.chars = val.sort((a, b) => a.data.name.localeCompare(b.data.name));
        this.chars.forEach((char) => {
          char.disabled = true;
          char.checked = false;
          this.primary = '';
        });
      });
    });
  }

  copyCharSettings = () => {
    this.service
      .copyCharSettings(
        this.chars.find(char => char.data.name === this.primary).id,
        this.chars.filter(char => char.checked).map(char => char.id)
      )
      .subscribe(() => {
        this.zone.run(() => {
          this.done = true;
          timer(10000).subscribe(() => (this.done = false));
          this.unselectAll();
        });
      });
  }

  unselectAll = () => {
    this.chars.forEach(char => (char.checked = false));
  }
}
