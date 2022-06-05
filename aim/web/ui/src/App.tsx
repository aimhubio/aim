import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import AlertBanner from 'components/kit/AlertBanner';
import SideBar from 'components/SideBar/SideBar';
import ProjectWrapper from 'components/ProjectWrapper/ProjectWrapper';
import Theme from 'components/Theme/Theme';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { checkIsBasePathInCachedEnv, getBasePath } from 'config/config';

import routes from 'routes/routes';

import { inIframe } from 'utils/helper';
//
// import { modify } from './modules/BaseExplorerCore/pipeline/modifier';
// import {
//   GroupType,
//   Order,
//   // @ts-ignore
// } from './modules/BaseExplorerCore/pipeline/modifier/applyModifier';

import './App.scss';

const basePath = getBasePath(false);

const isVisibleCacheBanner = checkIsBasePathInCachedEnv(basePath) && inIframe();

// const data = [
//   {
//     name: 'A',
//     lr: 11,
//     bs: 128,
//   },
//   {
//     name: 'B',
//     lr: 12,
//     bs: 64,
//   },
//   {
//     name: 'C',
//     lr: 10,
//     bs: 16,
//   },
//   {
//     name: 'D',
//     lr: 30,
//     bs: 32,
//   },
//   {
//     name: 'B',
//     lr: 20,
//     bs: 64,
//   },
// ];

function App(): React.FunctionComponentElement<React.ReactNode> {
  // console.log(data);
  // const mod1 = modify({
  //   objectList: data,
  //   modifier: {
  //     fields: ['lr'],
  //     orders: [Order.DESC],
  //     type: GroupType.COLUMN,
  //   },
  // });
  //
  // const mod2 = modify({
  //   objectList: mod1.data,
  //   modifier: {
  //     fields: ['name'],
  //     orders: [Order.ASC],
  //     type: GroupType.ROW,
  //   },
  // });
  //
  // const mod3 = modify({
  //   objectList: mod2.data,
  //   modifier: {
  //     fields: ['name'],
  //     orders: [Order.ASC],
  //     type: GroupType.COLUMN,
  //   },
  // });

  return (
    <>
      <BrowserRouter basename={basePath}>
        <ProjectWrapper />
        <Theme>
          {isVisibleCacheBanner && (
            <AlertBanner type='warning' isVisiblePermanently={true}>
              You are using UI from notebook env, please make sure to
              <b>keep server running</b> for a better experience
            </AlertBanner>
          )}
          <div className='pageContainer'>
            <ErrorBoundary>
              <SideBar />
            </ErrorBoundary>
            <div className='mainContainer'>
              <React.Suspense
                fallback={<BusyLoaderWrapper height='100vh' isLoading />}
              >
                <Switch>
                  {Object.values(routes).map((route, index) => {
                    const { component: Component, path, isExact } = route;
                    return (
                      <Route path={path} key={index} exact={isExact}>
                        <ErrorBoundary>
                          <Component />
                        </ErrorBoundary>
                      </Route>
                    );
                  })}
                  <Redirect to='/' />
                </Switch>
              </React.Suspense>
            </div>
          </div>
        </Theme>
      </BrowserRouter>
    </>
  );
}

// group [column] by [name] [asc]
// group [column] by [lr] [desc]
// group [column] by [index] [desc]
//
// const groups = {
//   hash1: {
//     field: 'name',
//     value: 'A',
//     order: 0,
//   },
//   hash2: {
//     field: 'name',
//     value: 'B',
//     order: 1,
//   },
//
//   // after lr
//   hash3: {
//     field: 'lr',
//     value: 0.003,
//     order: 0,
//   },
//   hash4: {
//     field: 'lr',
//     value: 0.001,
//     order: 1,
//   },
//
//   // after index
//   hash5: {
//     field: 'index',
//     value: 3,
//     order: 3,
//   },
//   hash6: {
//     field: 'index',
//     value: 2,
//     order: 2,
//   },
//   hash7: {
//     field: 'index',
//     value: 1,
//     order: 1,
//   },
//   hash8: {
//     field: 'index',
//     value: 0,
//     order: 0,
//   },
// };
//
// const objects = [
//   {
//     index: 0,
//     name: 'A',
//     lr: 0.001,
//     groups: {
//       column: ['hash1', ['hash4', ['hash8']]], // 0 -> 1 -> 3 || => left = (0 + 1 + 3) * boxWidth = 400
//     },
//   },
//   {
//     index: 1,
//     name: 'A',
//     lr: 0.001,
//     groups: {
//       column: ['hash1', ['hash4', ['hash7']]], // 0 -> 1 -> 2 || => left = (0 + 1 + 2) * boxWidth = 300
//     },
//   },
//   {
//     index: 2,
//     name: 'B',
//     lr: 0.003,
//     groups: {
//       column: ['hash2', ['hash3', ['hash6']]], // 1 -> 0 -> 1 || => left = (1 + 0 + 2) * boxWidth = 300
//     },
//   },
//   {
//     index: 3,
//     name: 'B',
//     lr: 0.003,
//     groups: {
//       column: ['hash2', ['hash3', ['hash5']]], // 1 -> 0 -> 0 || => left = (1 + 0 + 0) * boxWidth = 100
//     },
//   },
// ];

export default App;
