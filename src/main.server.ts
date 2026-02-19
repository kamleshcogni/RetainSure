import { bootstrapApplication, type BootstrapContext } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

// (Optional, but good practice for SSR utilities)
// import { provideServerRendering } from '@angular/platform-server';

const serverConfig = {
  providers: [
    provideRouter(routes),
    // Use fetch on the server too
    provideHttpClient(withFetch()),
    // provideServerRendering(),
  ],
};

// 👇 Export a function that takes BootstrapContext and forwards it to bootstrapApplication
export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(App, serverConfig, context);
}
``