import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from './../app.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { concatMap } from 'rxjs/operators';

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

  constructor(private service: AppService, private router: Router, private zone: NgZone,
              private dialogRef: MatDialogRef<SelectComponent>) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    this.service.resetDir().subscribe((val) => {
        this.allDrives = val;
        this.selectedDrive = '';
      });
  }

  setConfig = () => {
    this.service.setConf(this.selectedConfiguration).subscribe(() => {
      this.zone.run(() => {
        this.service.path = `${this.selectedDrive}/${this.selectedConfiguration}`;
        this.router.navigate(['']);
        this.dialogRef.close();
      });
    });
  }

  getConfig = (drive: string) => {
    this.service.setDrive(drive).subscribe((val) => {
        this.allConfigurations = val;
        this.selectedConfiguration = '';
      });
  }
}
