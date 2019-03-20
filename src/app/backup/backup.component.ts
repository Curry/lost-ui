import { MatDialogRef } from '@angular/material/dialog';
import { Backup, Data } from './../models/models';
import { AppService } from '../app.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {
  backups: Backup[];
  data: Data[];
  type: string;
  selectedBackup: string;
  constructor(private service: AppService, private router: Router, private zone: NgZone,
              private dialogRef: MatDialogRef<BackupComponent>) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    this.service.getBackups()
      .subscribe((backups) => {
        this.backups = backups;
      });
  }

  getBackupInfo = (zFile: string) => {
    this.type = zFile.substring(0, 1) === 'c' ? 'character(s)' : 'account(s)';
    this.service.getBackupInfo(zFile).subscribe((data) => {
      this.data = data;
    });
  }

  restoreBackup = (zFile: string) => {
    this.service.restoreBackup(zFile)
    .pipe(delay(1000))
    .subscribe(() => {
      this.zone.run(() => {
        this.router.navigate(['']);
        this.dialogRef.close();
      });
    });
  }
}