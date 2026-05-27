import { Routes, UrlMatcher, UrlSegment } from '@angular/router';

import { Detail } from './detail/detail';
import { Index } from './index';
import { AppHelpers } from './helpers/app.helpers';

export const apiIdMatcher: UrlMatcher = (segments: UrlSegment[]) => {
  if (segments.length !== 1) {
    return null;
  }

  const apiId = segments[0].path;
  const apiConfig = AppHelpers.matchApiConfig(apiId);
  if (!apiConfig) {
    return null;
  }

  return {
    consumed: segments,
    posParams: {
      id: segments[0],
    },
  };
};

export const routes: Routes = [
  {
    matcher: apiIdMatcher,
    component: Detail,
  },
  {
    path: '**',
    component: Index,
  },
];

