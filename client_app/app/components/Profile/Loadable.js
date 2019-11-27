import loadable from 'loadable-components';
import LoadingIndicator from 'components/LoadingIndicator';

export default loadable({
  loader: () => import('./index'),
  loading: LoadingIndicator
});