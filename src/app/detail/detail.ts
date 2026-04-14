import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import YAML from 'js-yaml';

import SwaggerUI from 'swagger-ui-dist/swagger-ui-bundle';

import { HeaderComponent } from '../shared/header/header.component';
import { Footer } from '../shared/footer/footer';

import { API_Config } from '../config/api-config';
import { AppHelpers } from '../helpers/app.helpers';
import { API_Tokens } from '../config/api-tokens.local';
import { PlaceholderContext, PlaceholderHandler } from './placeholders/placeholder';

interface PageModel {
  errorMessage: string | null,
  apiConfig: API_Config | null,
};

type PlaceholderModule = {
  default: new () => PlaceholderHandler;
};

export type PlaceHolderKey =
  | 'today'
  | 'isoTimestamp';

const handlerLoaders: Record<PlaceHolderKey, () => Promise<PlaceholderModule>> = {
  today: () => import('./placeholders/today'),
  isoTimestamp: () => import('./placeholders/iso-timestamp'),
};

@Component({
  standalone: true,
  selector: 'detail',
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
  imports: [HeaderComponent, Footer],
})
export class Detail implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  public model: PageModel;

  @ViewChild('swaggerContainer', { static: true })
  protected swaggerContainer!: ElementRef<HTMLDivElement>;

  public constructor() {
    this.model = {
      errorMessage: null,
      apiConfig: null,
    };
  }

  public async ngOnInit(): Promise<void> {
    const apiId = this.route.snapshot.paramMap.get('id');
    
    const apiConfig = AppHelpers.matchApiConfig(apiId);
    if (!apiConfig) {
      this.model.errorMessage = 'API document not found.';
    }

    this.model.apiConfig = apiConfig;
  }

  public async ngAfterViewInit(): Promise<void> {
    const apiConfig = this.model.apiConfig;
    if (!apiConfig) {
      return;
    }

    const apiId = apiConfig.id;
    const bearerToken = API_Tokens[apiId] ?? null;
    if ((bearerToken === null) || (bearerToken.startsWith('PLACEHOLDER_'))) {
      console.error('No token found for ' + apiId + ', check API_Tokens');
      return;
    }

    try {
      const rawYaml = await this.loadYamlText(apiConfig.yamlPath);
      const spec = this.parseYaml(rawYaml);

      const ui = SwaggerUI({
        spec,
        domNode: this.swaggerContainer.nativeElement,
        deepLinking: false,
        displayRequestDuration: true,
        docExpansion: 'list',
        tryItOutEnabled: true,
        requestInterceptor: (request: any) => {
          request.headers.Authorization = 'Bearer ' + bearerToken;
          return request;
        },
        onComplete: () => {
          ui.preauthorizeApiKey("bearerAuth", bearerToken);
        },
      });
    } catch (error) {
      console.error(error);
      this.model.errorMessage = 'Failed to load API document.';
    }
  }

  private parseYaml(yamlText: string): object {
    yamlText = yamlText.replaceAll('{{today}}', AppHelpers.todayYMD());
    yamlText = yamlText.replaceAll('{{isoTimestamp}}', AppHelpers.nowZulu());
    
    const parsed = YAML.load(yamlText);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Parsed YAML is empty or invalid.');
    }

    return parsed as object;
  }

  private async loadYamlText(yamlPath: string): Promise<string> {
    const response = await fetch(yamlPath);

    if (!response.ok) {
      throw new Error(`Failed to load YAML file: ${yamlPath}`);
    }

    const yamlText = await response.text();
    return yamlText;
  }
}
