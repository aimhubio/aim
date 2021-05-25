import Swagger from 'swagger-client';

import { SERVER_HOST } from '../config';

function setApiClient() {
  return new Promise((resolve, reject) => {
    if (!window.ApiClient) {
      Swagger(
        `${
          window.app?.env === 'dev' ? '' : '/static-files'
        }/swagger.0.0.8.yaml`,
      )
        .then((client) => {
          client.spec.servers = [
            {
              url: `${SERVER_HOST}/{basePath}`,
              variables: {
                basePath: {
                  default: 'api/v1',
                },
              },
            },
          ];
          client.http.withCredentials = true;
          window.ApiClient = client;
          resolve(window.ApiClient);
        })
        .catch((err) => reject(err));
    } else {
      resolve(window.ApiClient);
    }
  });
}

export default function callApi(apiName, params = {}, customOptions = {}) {
  return new Promise((resolve, reject) => {
    setApiClient()
      .then((ApiClient) => {
        let operationId = apiName.split('.').splice(-1);
        let callable = eval(`ApiClient.apis.${apiName}`);
        let options = {};

        // Get method
        let method;
        for (let pathName in ApiClient.spec.paths) {
          for (let path in ApiClient.spec.paths[pathName]) {
            if (
              ApiClient.spec.paths[pathName][path].operationId == operationId
            ) {
              method = path;
              break;
            }
          }
        }

        // Assign default options
        options = Object.assign({}, options, customOptions);

        // Assign body parameters
        if (method && method !== 'get' && method && method !== 'options') {
          options = Object.assign({}, options, {
            requestBody: params,
          });
        }

        // Define server
        if (!('server' in options)) {
          options = Object.assign({}, options, {
            server: `${SERVER_HOST}/{basePath}`,
            serverVariables: {
              basePath: 'api/v1',
            },
          });
        }

        // Call API
        callable
          .call(null, params, options)
          .then((data) => resolve(data.body))
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => reject(err));
  });
}
