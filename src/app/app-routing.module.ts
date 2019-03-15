import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CharCopyComponent } from './char-copy/char-copy.component';
import { AccCopyComponent } from './acc-copy/acc-copy.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/char',
    pathMatch: 'full'
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
