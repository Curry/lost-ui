import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CharCopyComponent } from './char-copy/char-copy.component';
import { AccCopyComponent } from './acc-copy/acc-copy.component';
import { SelectComponent } from './select/select.component';

const routes: Routes = [
  {
    path: '',
    component: SelectComponent
  },
  {
    path: 'char',
    component: CharCopyComponent
  },
  {
    path: 'acc',
    component: AccCopyComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
