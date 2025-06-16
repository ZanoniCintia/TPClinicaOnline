import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalInputComponent } from './modal-input.component';
import { FormsModule } from '@angular/forms'; // <-- IMPORTANTE

@NgModule({
  declarations: [ModalInputComponent],
  imports: [
    CommonModule,
    FormsModule 
  ],
  exports: [ModalInputComponent] 
})
export class ModalInputModule { }
