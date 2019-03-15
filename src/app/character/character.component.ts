import { AppService } from './../app.service';
import { Component } from '@angular/core';
import { Char } from '../models/models';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss']
})
export class CharacterComponent {
  test = ['2112823914', '2113091948', '2113253909', '2113388487', '2113585107',
          '2113995922', '2114076137', '2114076229', '2115027786', '2115027877',
          '94156388', '94156407', '94209422', '10727782', '15051148', '15319111',
          '15765625', '15765740', '16065104'];

  constructor(public service: AppService) {
    // forkJoin(this.test.map(this.service.getCharInfo))
    //   .pipe(map(char => char.filter(val => val.data)))
    //   .subscribe((val: Char[]) => {
    //     this.chars = val;
    //   });
  }


  check = (char: Char) => {
    char.checked = !char.checked;
  }

  public get chars() {
    return this.service.chars;
  }

}
