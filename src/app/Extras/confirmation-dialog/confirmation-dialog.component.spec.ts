import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveClientDialogComponent } from './remove-client-dialog.component';

describe('RemoveClientDialogComponent', () => {
  let component: RemoveClientDialogComponent;
  let fixture: ComponentFixture<RemoveClientDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemoveClientDialogComponent]
    });
    fixture = TestBed.createComponent(RemoveClientDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
