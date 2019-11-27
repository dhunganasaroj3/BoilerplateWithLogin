import Loadable from 'routing/Loadable';
import LoadingIndicator from 'components/LoadingIndicator';
import { handleLoadedModules } from '../Loadable';

export default Loadable({
  loader: ({ injectReducer, injectSagas }) =>
    Promise.all([
      import("../reducers"),
      import("../sagas"),
      import("./index")
    ]).then(handleLoadedModules(injectReducer, injectSagas)),
  loading: LoadingIndicator
});
