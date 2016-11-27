// @flow
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import createLogger from 'redux-logger';

import appConfig from '../config/main';

import rootReducer from 'reducers';

const sagaMiddleware = createSagaMiddleware();
const devtools = typeof window === 'function' && window.devToolsExtension ?
  window.devToolsExtension :
  (() => noop => noop);

export default function configureStore(history, initialState: Object) {
  const middlewares = [
    sagaMiddleware,
  ];

  if (appConfig.env !== 'production' && process.env.BROWSER) {
    const logger = createLogger();
    middlewares.push(logger);
  }

  const enhancers = [
    applyMiddleware(...middlewares),
    devtools(),
  ];

  const store = createStore(
    rootReducer,
    initialState,
    compose(...enhancers)
  );

  store.runSaga = sagaMiddleware.run;

  store.close = () => {
    store.dispatch(END);
  };

  if (appConfig.env === 'development' && (module).hot) {
    (module).hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
