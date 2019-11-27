import Loadable from 'routing/Loadable';
import LoadingIndicator from 'components/LoadingIndicator';

export const handleLoadedModules = (injectReducer, injectSagas) => (
  [reducer, sagas, component]
) => {
  injectReducer('registerConfirmUser', reducer.default);
  injectSagas('registerConfirmUserSaga', sagas.default);
  return component;
};

export default Loadable({
  loader: ({ injectReducer, injectSagas }) =>
    Promise.all([
      import('./reducers'),
      import('./sagas'),
      import('./index')
    ]).then(handleLoadedModules(injectReducer, injectSagas)),
  loading: LoadingIndicator
});
