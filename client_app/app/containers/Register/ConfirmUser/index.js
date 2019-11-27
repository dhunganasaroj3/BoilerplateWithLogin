import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Link } from 'react-router-dom';
import { confirmUserRequest } from './actions';
import { makeSelectRequesting, makeSelectError, makeSelectResponse, makeSelectSuccess } from './selectors';
import Spinner from 'components/common/Spinner';

const mapStateToProps = createStructuredSelector({
  isRequesting: makeSelectRequesting(),
  success: makeSelectSuccess(),
  errorResponse: makeSelectError(),
  successResponse: makeSelectResponse()
});

const mapDispatchToProps = (dispatch) => ({
  confirmUser: (userId) => dispatch(confirmUserRequest(userId))
});

class ConfirmUser extends React.Component {
  static propTypes = {
    isRequesting: PropTypes.bool.isRequired,
    success: PropTypes.bool.isRequired,
    confirmUser: PropTypes.func.isRequired,
    match: PropTypes.object
  };
  componentDidMount() {
    const { userId } = this.props.match.params;
    if (userId) this.props.confirmUser(userId);
  }
  render() {
    const { requesting, success, errorResponse, successResponse, isRequesting } = this.props;
    return (
      <section className="ptn-1 align-center">
        {/*{isRequesting && <Spinner />}*/}
        { isRequesting ? <Spinner /> : (
          <div className="wrapper">
            <div className="align-center">
              <div className={`segment message ${success ? 'positive': 'negative'} card-center card-md has-img-floating`}>
                <div className="img-floating round bg-black"><i className="icon-users" /></div>
                { successResponse && typeof successResponse === 'string' &&
                <p className="mg-all-md">
                  { successResponse }
                </p> }
                { errorResponse && typeof errorResponse === 'string' &&
                <p className="mg-all-md">{ errorResponse } </p> }
                <Link className="fluid button primary" to="/">
                  Continue
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmUser);
