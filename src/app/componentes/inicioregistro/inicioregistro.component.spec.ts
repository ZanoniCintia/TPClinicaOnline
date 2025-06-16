import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioregistroComponent } from './inicioregistro.component';

describe('InicioresgistroComponent', () => {
  let component: InicioregistroComponent;
  let fixture: ComponentFixture<InicioregistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioregistroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioregistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
