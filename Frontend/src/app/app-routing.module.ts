import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MybookingComponent } from './mybooking/mybooking.component';
import { SearchFormComponent } from './search-form/search-form.component';
const routes: Routes = [
  { path:'mybooking', component: MybookingComponent},
  { path:'', component: SearchFormComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
