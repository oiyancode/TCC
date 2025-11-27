import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CartComponent } from './cart.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { CartService } from '../../services/cart.service';
import { of } from 'rxjs';

// Mock CartService
class MockCartService {
  cartItems$ = of([]);
  cartItemCount$ = of(0);
  getCartTotalFormatted = () => '$0.00';
  getCartTotal = () => 0;
}

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CartComponent,
        CommonModule,
        RouterTestingModule,
        NavbarComponent,
      ],
      providers: [{ provide: CartService, useClass: MockCartService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display sections in the correct order in the DOM', () => {
    const container = fixture.debugElement.query(By.css('.cart-container'));
    const sections = container.children;

    // Check if we have 3 sections
    expect(sections.length).toBe(3);

    // Get the class lists of the sections in their DOM order
    const sectionClassesInOrder = sections.map(
      (section) => section.nativeElement.classList
    );

    // Assert the order of sections by their unique classes
    expect(sectionClassesInOrder[0].contains('products-section')).toBeTrue();
    expect(sectionClassesInOrder[1].contains('address-section')).toBeTrue();
    expect(sectionClassesInOrder[2].contains('payment-section')).toBeTrue();
  });
});
