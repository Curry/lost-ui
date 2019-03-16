import { AppService } from './app.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public service: AppService, private router: Router) { }

  public get selected() {
    return this.service.selected;
  }

  changeFolder = () => {
    this.service.selected = false;
    this.router.navigate(['']);
  }
}
