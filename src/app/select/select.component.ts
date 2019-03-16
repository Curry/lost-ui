import { Router } from '@angular/router';
import { AppService } from './../app.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { map, concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
  selectedDrive: string;
  selectedConfiguration: string;
  allDrives: string[];
  allConfigurations: string[];
  ready = false;

  constructor(private service: AppService, private router: Router, private zone: NgZone) { }

  ngOnInit() {
    this.service.resetDir()
      .pipe(
        concatMap(() => this.service.getPossibleFiles(/([a-z]{1})(.*)(tq|sisi)/))
      ).subscribe((val) => {
        this.allDrives = val;
      });
  }

  setConfig = () => {
    this.service.setConf(this.selectedConfiguration).subscribe(() => {
      this.zone.run(() => {
        this.service.selected = true;
        this.service.path = `${this.selectedDrive}/${this.selectedConfiguration}`;
        this.router.navigate(['char'], { queryParams: { refresh: true } });
      });
    });
  }

  getConfig = (drive: string) => {
    this.service.setDrive(drive)
      .pipe(
        map(() => /(settings)/),
        concatMap(this.service.getPossibleFiles)
      ).subscribe((val) => {
        this.allConfigurations = val;
      });
  }
}
