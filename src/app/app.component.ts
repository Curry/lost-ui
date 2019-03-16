import { AppService } from './app.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public service: AppService, private router: Router) { }

  ngOnInit() {
    this.changeFolder();
  }

  public get selected() {
    return this.service.selected;
  }

  public get path() {
    return this.service.path;
  }

  changeFolder = () => {
    this.service.selected = false;
    this.router.navigate(['']);
  }
}
