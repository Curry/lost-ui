import { Data, RawData } from './../models/models';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { AppService } from './../app.service';
import { Component, OnInit, NgZone } from '@angular/core';

class SpecialData {
  [id: string]: Data[];
}
@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  specData: SpecialData;
  selectedChars: SpecialData;
  selectedAccs: SpecialData;
  ready: boolean;
  constructor(
    private service: AppService,
    private zone: NgZone,
    private router: Router,
    private dialogRef: MatDialogRef<ImportComponent>
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.selectedAccs = {};
    this.selectedChars = {};
    this.specData = {};
  }

  public getChars = (profileName: string) =>
    (this.specData[profileName] ? this.specData[profileName] : []).filter(val => val.type === 0)

  public getAccs = (profileName: string) =>
    (this.specData[profileName] ? this.specData[profileName] : []).filter(val => val.type === 1)

  public hasChars = (profileName: string) => this.getChars(profileName).length > 0;

  public hasAccs = (profileName: string) => this.getAccs(profileName).length > 0;

  public hasData = () => Object.keys(this.specData).reduce((acc, key) => (acc += this.specData[key].length), 0) > 0;


  public get profileNames() {
    return Object.keys(this.specData);
  }

  ngOnInit() {
    this.ready = false;
    this.service.getImports().subscribe(vals => {
      this.zone.run(() => {
        vals
          .filter(val => this.service.data.map(char => char.name).indexOf(val.name) === -1)
          .forEach(val =>
            this.specData[val.profileName] ? this.specData[val.profileName].push(val) : (this.specData[val.profileName] = [val])
          );
      });
    }, () => {}, () => {
      this.zone.run(() => {
        this.ready = true;
      });
    });
  }

  import = (all: boolean) => {
    const selectedData: Data[] = [];
    if (all) {
      Object.keys(this.specData).forEach(key => selectedData.push(...this.specData[key]));
    } else {
      Object.keys(this.selectedChars).forEach(key => selectedData.push(...this.selectedChars[key]));
      Object.keys(this.selectedAccs).forEach(key => selectedData.push(...this.selectedAccs[key]));
    }
    this.service
      .importData(
        selectedData.map(
          data =>
            ({
              profileName: data.profileName,
              fileName: data.fileName
            } as RawData)
        )
      )
      .subscribe(() => {
        this.zone.run(() => {
          this.router.navigate(['']);
          this.dialogRef.close();
        });
      });
  }
}
