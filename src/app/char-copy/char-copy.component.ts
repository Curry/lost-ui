import { AppService } from './../app.service';
import { Component, NgZone } from '@angular/core';
import { timer } from 'rxjs';

@Component({
  selector: 'app-char-copy',
  templateUrl: './char-copy.component.html',
  styleUrls: ['./char-copy.component.scss']
})
export class CharCopyComponent {
  primary: string;
  done: boolean;
  constructor(private service: AppService, private zone: NgZone) { }

  public get chars() {
    return this.service.chars;
  }

  public get charNames() {
    return this.chars.map((char) => char.data.name);
  }

  public get buttonDisabled() {
    return this.service.chars.reduce((acc, char) => acc += char.checked ? 1 : 0, 0) === 0;
  }

  copyCharSettings = () => {
    this.service.copyCharSettings(this.service.chars.find((char) => char.data.name === this.primary).id,
      this.service.chars.filter((char) => char.checked).map((char) => char.id))
      .subscribe(() => {
        this.zone.run(() => {
          this.done = true;
          timer(10000).subscribe(() => this.done = false);
          this.service.unselectAll();
        });
      });
  }

}
