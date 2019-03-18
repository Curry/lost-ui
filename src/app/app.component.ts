import { BackupComponent } from './backup/backup.component';
import { CopyType } from './models/models';
import { SelectComponent } from './select/select.component';
import { MatDialog } from '@angular/material/dialog';
import { AppService } from './app.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public service: AppService, private router: Router, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.router.navigate([''], { queryParams: { initial: true } });
  }

  public get path() {
    return this.service.path;
  }

  public setType(val: number) {
    this.service.type = val === 0 ? CopyType.CH : CopyType.AC;
  }

  changeFolder = () => {
    this.dialog.open(SelectComponent);
  }

  openBackups = () => {
    this.dialog.open(BackupComponent, {
      minWidth: '300px',
      minHeight: '250px'
    });
  }
}
