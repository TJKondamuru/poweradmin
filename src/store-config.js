import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { connectRouter,  routerMiddleware } from 'connected-react-router';

import * as Base from './Reducer/BaseReducer';

export default function configureStore(history, initialState) {
    const reducers = {
        appfiles : Base.filesMgmtReducer,
        homeentries: Base.homeEntriesReducer
    };
  
    const middleware = [
      thunk,
      routerMiddleware(history)
    ];
  
    // In development, use the browser's Redux dev tools extension if installed
    const enhancers = [];
    if (typeof window !== 'undefined' && window.devToolsExtension) {
      enhancers.push(window.devToolsExtension());
    }
  
    const rootReducer = combineReducers({
          router: connectRouter(history),
      ...reducers,
    });
  
    return createStore(
      rootReducer,
      initialState,
      compose(applyMiddleware(...middleware), ...enhancers)
    );
  }
  