import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {getLocaleFromRequest} from '~/lib/i18n';
import {createSanityContext} from 'hydrogen-sanity';

/**
 * The context implementation is separate from server.ts
 * so that type can be extracted for AppLoadContext
 * */
export async function createAppLoadContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const sanity = createSanityContext({
    request,

    // To use the Hydrogen cache for queries
    cache,
    waitUntil,
    preview: {
      enabled: session.get('projectId') === '6ut6pd3v',
      token:
        'skmEaKQmBkuQzPxUOYdGw7V8h2mQMZATZNSdQ3lMQQ6n6wFs7YQC8FT0jF3ZnTfOfd5JgIt7S2xQcpvpCVEMO1RMcoa7xTSgnNlyshrY8LVpWO1nEwxNsi2zktcbIniT0DC8lUpI5GZszCjGC968S1llrPYvzQGfmRSDF2PIqfQE6M8Cgsvj',
      studioUrl: 'http://localhost:3333',
    },

    // Sanity client configuration
    client: {
      projectId: '6ut6pd3v',
      dataset: env.SANITY_DATASET || 'production',
      apiVersion: env.SANITY_API_VERSION || 'v2024-08-08',
      useCdn: process.env.NODE_ENV === 'production',
    },
  });

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: getLocaleFromRequest(request),
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  return {
    ...hydrogenContext,
    sanity,
    // declare additional Remix loader context
  };
}
