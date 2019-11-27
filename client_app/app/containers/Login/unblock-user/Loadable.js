import Loadable from "routing/Loadable";
import LoadingIndicator from 'components/LoadingIndicator';

export const handleLoadedModules = (injectReducer, injectSagas) => (
  [reducer, sagas, component]
) => {
  injectReducer("loginUnblockUser", reducer.default);
  injectSagas("loginUnblockUserSaga", sagas.default);
  return component;
};

export default Loadable({
  loader: ({ injectReducer, injectSagas }) =>
    Promise.all([
      import("./reducer"),
      import("./sagas"),
      import("./index")
    ]).then(handleLoadedModules(injectReducer, injectSagas)),
  loading: LoadingIndicator
});
