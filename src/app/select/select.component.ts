import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from './../app.service';
import { Component, OnInit, NgZone } from '@angular/core';

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
    this.service.getDrives().subscribe((val) => {
        this.allDrives = val;
        this.selectedDrive = '';
      });
  }

  setConfig = () => {
    this.service.selectProfile(this.selectedConfiguration).subscribe((path) => {
      this.zone.run(() => {
        this.service.path = path;
        this.router.navigate(['']);
        this.dialogRef.close();
      });
    });
  }

  getConfig = (drive: string) => {
    this.service.selectDrive(drive).subscribe((val) => {
        this.allConfigurations = val;
        this.selectedConfiguration = '';
      });
  }
}
