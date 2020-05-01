import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SecretPlacesComponent} from './secret-places.component';
import {RouterModule} from '@angular/router';
import { FormComponent } from './form/form.component';
import {FormModule} from './form/form.module';


const routes = [
    {
        path     : 'secret_places',
        component: SecretPlacesComponent
    }
];

@NgModule({
  declarations: [
      SecretPlacesComponent
  ],
    imports: [
        RouterModule.forChild(routes),
        FormModule,
    ],
  exports: [
  ]
})
export class SecretPlacesModule { }