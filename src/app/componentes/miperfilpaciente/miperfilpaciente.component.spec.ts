import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiperfilpacienteComponent } from './miperfilpaciente.component';

describe('MiperfilpacienteComponent', () => {
  let component: MiperfilpacienteComponent;
  let fixture: ComponentFixture<MiperfilpacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiperfilpacienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiperfilpacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
