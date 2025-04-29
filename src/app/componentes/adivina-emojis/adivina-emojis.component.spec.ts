import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdivinaEmojisComponent } from './adivina-emojis.component';

describe('AdivinaEmojisComponent', () => {
  let component: AdivinaEmojisComponent;
  let fixture: ComponentFixture<AdivinaEmojisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdivinaEmojisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdivinaEmojisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
