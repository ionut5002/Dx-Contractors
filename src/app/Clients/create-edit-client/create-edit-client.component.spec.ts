import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditClientComponent } from './create-edit-client.component';

describe('CreateEditClientComponent', () => {
  let component: CreateEditClientComponent;
  let fixture: ComponentFixture<CreateEditClientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditClientComponent]
    });
    fixture = TestBed.createComponent(CreateEditClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
