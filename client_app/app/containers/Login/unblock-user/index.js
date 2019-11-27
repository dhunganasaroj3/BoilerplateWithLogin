import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { Link } from 'react-router-dom';
import { unblockUserRequest } from './actions';
import { makeSelectRequesting, makeSelectError, makeSelectResponse, makeSelectSuccess } from './selectors';
import Spinner from 'components/common/Spinner';

const mapStateToProps = createStructuredSelector({
  successResponse: makeSelectResponse(),
  errorResponse: makeSelectError(),
  isRequesting: makeSelectRequesting(),
  success: makeSelectSuccess()
});

const mapDispatchToProps = (dispatch) => ({
  unblockUser: (unlockId) => dispatch(unblockUserRequest(unlockId)),
});

class UnblockUser extends React.Component {
  static propTypes = {
    unblockUser: PropTypes.func.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    success: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    const unblockId = this.props.match.params.unblockId;
    this.props.unblockUser(unblockId);
  }

  render() {
    const { isRequesting, errorResponse, successResponse, success } = this.props;
    return (
      <section className="ptn-1 align-center">
        { isRequesting ? <Spinner /> : (
          <div className="wrapper">
            <div className="align-center">
              <div className={`segment message ${success ? 'positive': 'negative'} card-center card-md has-img-floating`}>
                <div className="img-floating round bg-black"><i className="icon-users" /></div>
                { successResponse && typeof successResponse === 'string' &&
                <p className="mg-all-md">{ successResponse || 'Your unblock was successful' }</p> }
                { errorResponse && typeof errorResponse === 'string' &&
                <p className="mg-all-md">{ errorResponse || 'Something went wrong!' } </p> }
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

export default connect(mapStateToProps, mapDispatchToProps)(UnblockUser);
