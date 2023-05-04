import _ from 'lodash-es';

import { encode } from 'utils/encoder/encoder';

import { PersistenceTypesEnum, StoreSliceMethods } from '../engine/types';
import browserHistory from '../services/browserHistory';

import getUrlSearchParam from './getUrlSearchParam';
import getUpdatedUrl from './getUpdatedUrl';

function setUrlPersistence(
  persistenceKey: string,
  originalMethods: StoreSliceMethods,
) {
  const overrideMethods: StoreSliceMethods = { ...originalMethods };
  const stateFromStorage = getUrlSearchParam(persistenceKey) || {};

  // update state
  if (!_.isEmpty(stateFromStorage)) {
    originalMethods.update(stateFromStorage);
  }
  overrideMethods.update = (d: any) => {
    originalMethods.update(d);
    const url = getUpdatedUrl(persistenceKey, encode(d));

    if (url !== `${window.location.pathname}${window.location.search}`) {
      browserHistory.push(url, null);
    }
  };

  overrideMethods.reset = () => {
    originalMethods.reset();

    const url = getUpdatedUrl(persistenceKey, encode({}));

    if (url !== `${window.location.pathname}${window.location.search}`) {
      browserHistory.push(url, null);
    }
  };
  return overrideMethods;
}

function setLocalStoragePersistence(
  persistenceKey: string,
  originalMethods: StoreSliceMethods,
) {
  // @TODO implement
  return originalMethods;
}

function setStatePersistence(
  persistenceKey: string,
  persistenceType: PersistenceTypesEnum,
  originalMethods: StoreSliceMethods,
): StoreSliceMethods {
  if (!persistenceType) {
    return originalMethods;
  }
  const persistenceDictCb = {
    [PersistenceTypesEnum.Url]: setUrlPersistence,
    [PersistenceTypesEnum.LocalStorage]: setLocalStoragePersistence,
  };
  const cb = persistenceDictCb[persistenceType];
  return cb(persistenceKey, originalMethods);
}

export default setStatePersistence;
