import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
  SocialAuthServiceConfig,
} from '@abacritt/angularx-social-login';
import { environment } from '../environments/environment';
import { AuthInterceptor } from './authentication/auth-interceptor';
import { PaystackWrapperModule } from './paystack-wrapper-module';

const GOOGLE_CLIENT_ID = environment.google_client_id;
const FACEBOOK_APP_ID = environment.facebook_client_id;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    interceptorProvider(),
    socialLoginProvider(),
    importProvidersFrom(PaystackWrapperModule),
  ],
};

function interceptorProvider() {
  return { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true };
}

function socialLoginProvider() {
  const provider = {
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
function provideAngular4Paystack(
  arg0: string
):
  | import('@angular/core').Provider
  | import('@angular/core').EnvironmentProviders {
  throw new Error('Function not implemented.');
}
