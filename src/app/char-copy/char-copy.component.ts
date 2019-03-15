import { AppService } from './../app.service';
import { Component, NgZone, OnInit } from '@angular/core';
import { timer, forkJoin } from 'rxjs';
import { Char } from '../models/models';
import { map, exhaustMap } from 'rxjs/operators';

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
    this.service
      .getFiles()
      .pipe(
        map(files =>
          files.filter(file => /(core_)(.{4}_[0-9]+)/.test(file)).map(val => val.split('_')[2].split('.')[0])
        ),
        exhaustMap(files => forkJoin(files.map(this.service.getCharInfo))),
        map(chars => chars.filter(val => val.data))
      )
      .subscribe((val: Char[]) => {
        this.zone.run(() => {
          this.chars = val.sort((a, b) => a.data.name.localeCompare(b.data.name));
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
