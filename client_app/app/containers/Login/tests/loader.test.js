import createMemoryHistory from 'history/createMemoryHistory';

import configureStore from 'store';

import Login from '../index';
import createLoader from '../loader';

describe('Login loader', () => {
  const store = configureStore({}, createMemoryHistory());

  const loader = createLoader(store);

  it('loads Login', () => {
    const loaded = new Promise((resolve) => (loader(resolve)));
    expect.assertions(1);
    return loaded.then((comp) => expect(comp.default).toEqual(Login));
  });
});
