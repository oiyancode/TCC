import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    // Don't run detectChanges here, do it in each test
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have a yellow background on the search button on cart page', () => {
    // Set the component property to simulate being on the cart page
    component.isCartPage = true;
    fixture.detectChanges(); // Trigger change detection

    const searchButton = fixture.debugElement.query(
      By.css('.navbar__search-btn')
    );
    // The button should now be visible and exist in the DOM
    expect(searchButton).toBeTruthy();

    const element = searchButton.nativeElement as HTMLElement;
    const style = window.getComputedStyle(element);

    // The button itself has the background color
    expect(style.backgroundColor).toBe('rgb(255, 217, 0)'); // #ffd900
  });
});
