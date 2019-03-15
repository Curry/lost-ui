import { AppService } from './app.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { Char } from './models/models';
import { forkJoin } from 'rxjs';
import { map, exhaustMap } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private service: AppService, private zone: NgZone) { }

  ngOnInit() {
    this.service.getFiles()
      .pipe(
        map((files) => files.filter((file) => /(core_)(.{4}_[0-9]+)/.test(file)).map((val) => val.split('_')[2].split('.')[0])),
        exhaustMap((files) => forkJoin(files.map(this.service.getCharInfo))),
        map(chars => chars.filter(val => val.data))
      ).subscribe((val: Char[]) => {
        this.zone.run(() => {
          this.service.chars = val.sort((a, b) => a.data.name.localeCompare(b.data.name));
        });
      });
  }
}
