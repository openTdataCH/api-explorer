export interface API_Config {
  id: string;
  title: string;
  yamlPath: string;
}

export const API_Data: API_Config[] = [
  {
    id: 'formation',
    title: 'Formation Service',
    yamlPath: './openapi/formation/openapi.template.yaml',
  },
  {
    id: 'ojp1.0',
    title: 'OJP 1.0',
    yamlPath: './openapi/ojp1.0/openapi.template.yaml',
  },
  {
    id: 'ojp2.0',
    title: 'OJP 2.0',
    yamlPath: './openapi/ojp2.0/openapi.template.yaml',
  },
  {
    id: 'ojpfare',
    title: 'OJP Fare',
    yamlPath: './openapi/ojpfare/openapi.template.yaml',
  },
  {
    id: 'traffic_lights',
    title: 'Traffic lights',
    yamlPath: './openapi/traffic_lights/openapi.template.yaml',
  },
];
