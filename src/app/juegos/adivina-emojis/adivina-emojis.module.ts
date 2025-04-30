import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdivinaEmojisComponent } from './adivina-emojis.component';
import { AdivinaEmojisRoutingModule } from './adivina-emojis-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AdivinaEmojisComponent],
  imports: [
    CommonModule,
    FormsModule,
    AdivinaEmojisRoutingModule
  ]
})
export class AdivinaEmojisModule {}
