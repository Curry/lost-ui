import { LinkComponent } from './link/link.component';
import { ImportComponent } from './import/import.component';
import { BackupComponent } from './backup/backup.component';
import { SelectComponent } from './select/select.component';
import { MatDialog } from '@angular/material/dialog';
import { AppService } from './app.service';
import { Component, OnInit } from '@angular/core';
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
    this.service.type = val === 0 ? 'char' : 'user';
  }

  openChange = () => {
    this.dialog.open(SelectComponent, { disableClose: true });
  }

  openBackups = () => {
    this.dialog.open(BackupComponent, {
      minWidth: '300px',
      minHeight: '250px'
    });
  }

  openImport = () => {
    this.dialog.open(ImportComponent);
  }

  openLink = () => {
    this.dialog.open(LinkComponent);
  }
}
