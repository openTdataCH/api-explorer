import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HeaderComponent } from '../shared/header/header.component';
import { Footer } from '../shared/footer/footer';

import { API_Config, API_Data } from '../config/api-config';

interface PageModel {
  apis: API_Config[],
};

@Component({
  standalone: true,
  selector: 'index',
  templateUrl: './index.html',
  styleUrl: './index.scss',
  imports: [RouterLink, HeaderComponent, Footer],
})
export class Index {
  protected readonly title = signal('detail');
  public model: PageModel;

  public constructor() {
    this.model = {
      apis: API_Data,
    };
  }
}
