import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { GoogleLoginProvider, FacebookLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';

const GOOGLE_CLIENT_ID = '30074273134-iq09s7va44q5730af5evs17kjmrqqmua.apps.googleusercontent.com';
const FACEBOOK_APP_ID = '979035830574355';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    socialLoginProvider(), provideAnimationsAsync(), provideAnimationsAsync(),
  ],
};

function socialLoginProvider() {
  const provider =  {
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      lang: 'en',
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(GOOGLE_CLIENT_ID),
        },
        {
          id: FacebookLoginProvider.PROVIDER_ID,
          provider: new FacebookLoginProvider(FACEBOOK_APP_ID),
        },
      ],
      onError: (err) => {
        console.error(err);
      },
    } as SocialAuthServiceConfig,
  };

  return provider;
}
