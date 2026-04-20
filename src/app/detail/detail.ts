import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import YAML from 'js-yaml';

import SwaggerUI from 'swagger-ui-dist/swagger-ui-bundle';

import { HeaderComponent } from '../shared/header/header.component';
import { Footer } from '../shared/footer/footer';

import { API_Config } from '../config/api-config';
import { AppHelpers } from '../helpers/app.helpers';
import { API_Tokens } from '../config/api-tokens';
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
  | 'isoTimestamp'
  | 'RESPONSE_XML_LIR1'
  | 'RESPONSE_XML_TR1'
  | 'REQUEST_XML_TRR1';

const handlerLoaders: Record<PlaceHolderKey, () => Promise<PlaceholderModule>> = {
  today: () => import('./placeholders/today'),
  isoTimestamp: () => import('./placeholders/iso-timestamp'),
  RESPONSE_XML_LIR1: () => import('./placeholders/ojp-lir1'),
  RESPONSE_XML_TR1: () => import('./placeholders/ojp-tr1'),
  REQUEST_XML_TRR1: () => import('./placeholders/ojp-trr1'),
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
      const spec = await this.parseYaml(apiConfig, rawYaml);

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

  private computeIndentationSize(apiSpecTextLine: string, placeholderMatch: string): number {
    const placeholderMatchIdx = apiSpecTextLine.indexOf(placeholderMatch);
    const indentationSize = placeholderMatchIdx + 1;

    return indentationSize;
  }

  private async parseYaml(appConfig: API_Config, yamlText: string): Promise<object> {
    const parsedStep1 = YAML.load(yamlText);

    const mapPlaceholderValues: Record<string, (string | string[])> = {};

    const specTextLines = yamlText.split('\n');
    const newSpecTextLines: string[] = [];

    for (const apiSpecTextLine of specTextLines) {
      const placeholderMatches: string[] = apiSpecTextLine.match(/{{([^}]+?)}}/g) ?? [];
      if (placeholderMatches.length === 0) {
        newSpecTextLines.push(apiSpecTextLine);
        continue;
      }

      for (const placeholderMatch of placeholderMatches) {
        const placeholderKey = placeholderMatch.replaceAll('{', '').replaceAll('}', '');

        const value: string | string[] = await (async () => {
          if (placeholderKey in mapPlaceholderValues) {
            return mapPlaceholderValues[placeholderKey];
          }

          const placeholderContext: PlaceholderContext = {
            apiConfig: appConfig,
            apiSpec: parsedStep1,
          };

          if (!(placeholderKey in handlerLoaders)) {
            return placeholderMatch;
          }
          
          const placeholderLoader = handlerLoaders[placeholderKey as PlaceHolderKey];
          const placeholderModule = await placeholderLoader();
          const placeholderHandler = new placeholderModule.default();
          const placeholderValue = await placeholderHandler.resolve(placeholderContext);

          mapPlaceholderValues[placeholderKey] = placeholderValue;

          return placeholderValue;
        })();

        if (Array.isArray(value)) {
          // in case of array values (i.e. XML response) insert the values and keep the identation
          const indentationSize = this.computeIndentationSize(apiSpecTextLine, placeholderMatch);
          const indentationPadText = ' '.repeat(indentationSize);
          value.forEach(valueRow => {
            const newSpecTextLine = indentationPadText + valueRow;
            newSpecTextLines.push(newSpecTextLine);
          });
        } else {
          const newSpecTextLine = apiSpecTextLine.replace(placeholderMatch, value);
          newSpecTextLines.push(newSpecTextLine);
        }
      }
    }

    const newSpecText = newSpecTextLines.join('\n');
    
    const placeholderMatchesStep2 = newSpecText.match(/{{([^}]+?)}}/g) ?? [];
    if (placeholderMatchesStep2.length > 0) {
      console.error('YAML placeholders not replaced');
      console.log(placeholderMatchesStep2);
    }

    const parsed = YAML.load(newSpecText);
    
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
