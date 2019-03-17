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
    this.router.navigate([''], { queryParams: { default: true } });
  }

  public get selected() {
    return this.service.selected;
  }

  public get path() {
    return this.service.path;
  }

  public get type() {
    return this.service.type;
  }

  public setType(val: CopyType) {
    this.service.type = val;
  }

  changeFolder = () => {
    this.dialog.open(SelectComponent);
  }
}
