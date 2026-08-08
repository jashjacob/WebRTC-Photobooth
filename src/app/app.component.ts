import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KawaiiPhotoboothComponent } from './kawaii-photobooth/kawaii-photobooth.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, KawaiiPhotoboothComponent],
  template: `<app-kawaii-photobooth></app-kawaii-photobooth>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {
}
