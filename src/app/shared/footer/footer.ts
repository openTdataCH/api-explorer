import { Component } from '@angular/core';

interface PageModel {
  updateDateF: string,
};

@Component({
  standalone: true,
  selector: 'footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  public model: PageModel;

  public constructor() {
    this.model = {
      updateDateF: '20.Apr 2026'
    };
  }
}
