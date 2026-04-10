import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface PageModel {
  isIndex: boolean,
};

@Component({
  standalone: true,
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [RouterLink],
})
export class HeaderComponent {
  public model: PageModel;

  public constructor(private router: Router) {
    const isIndex = this.router.url === '/' || this.router.url === '';
    
    this.model = {
      isIndex: isIndex,
    };
  }
}
