import {
  ApplicationConfig,
  inject, isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {FirebaseApp, initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {connectFunctionsEmulator, getFunctions, provideFunctions} from '@angular/fire/functions';
import {environment} from '../environments/environment.development';
import {getAnalytics, provideAnalytics} from '@angular/fire/analytics';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';

const app = initializeApp(environment.firebaseConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => app),
    provideFunctions(() => {
      const functions = getFunctions(app, 'africa-south1');
      if (isDevMode() && environment.emulator) {
        console.log(`Connecting to Functions emulator on ${environment.emulator.host}:${environment.emulator.functionsPort}`);
        connectFunctionsEmulator(functions, environment.emulator.host, environment.emulator.functionsPort);
      }
      return functions;
    }),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};
