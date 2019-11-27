/**
 *
 * Test
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectTest from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';

export function Test() {
  useInjectReducer({ key: 'test', reducer });
  useInjectSaga({ key: 'test', saga });

  return (
    <div>
      <Helmet>
        <title>Test</title>
        <meta name="description" content="Description of Test" />
      </Helmet>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

Test.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  test: makeSelectTest(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(Test);
