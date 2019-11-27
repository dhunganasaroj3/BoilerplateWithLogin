import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import sadChild from 'assets/img/sad.png';
import Spinner from 'components/common/Spinner';
import { unSubscribeRequest } from './actions';
import {
  selectUnSubscribeRequest,
  makeSelectRequesting,
  makeSelectError,
  makeSelectResponse,
  makeSelectSuccess
} from './selectors';

const mapStateToProps = createStructuredSelector({
  unSubscribeRequest: selectUnSubscribeRequest(),
  successResponse: makeSelectResponse(),
  errorResponse: makeSelectError(),
  requesting: makeSelectRequesting(),
  success: makeSelectSuccess()
});

const mapDispatchToProps = (dispatch) => ({
  unSubscribe: (unSubscribeId) => dispatch(unSubscribeRequest(unSubscribeId)),
});

class UnSubscribe extends React.Component {
  static propTypes = {
    unSubscribe: PropTypes.func.isRequired
  };
  componentDidMount() {
    const unSubscriptionId = this.props.match.params.unsubscribeid;
    this.props.unSubscribe(unSubscriptionId);
  }

  render() {
    const { successResponse, errorResponse, requesting, success } = this.props;
    return (
      <div className="header-top-gap ptn-1 align-center">
        <section>
          <div className="container align-center">
            {!!requesting && <div className="green pd-btm-lg"><Spinner /></div>}
            {!requesting && !success && typeof errorResponse === 'string' &&
            <div className="pd-btm-lg">
              <div className="negative message">{errorResponse}</div>
            </div>}
            {!requesting && !!success && typeof successResponse === 'string' &&
            <div>
              <div className="clearfix mg-btm-md">
                <p className="green bold text-md">{successResponse}</p>
                <p className="bold text-md">We feel sorry to see you getting away from our emails.</p>
              </div>
              <img src={sadChild} style={{maxHeight: 300}} />
              <div className="pd-btm-md">
                <p>Whenever you change your mind,<br/>
                  Just fill the newsletter form at bottom of page.
                </p>
              </div>
            </div>}
          </div>
        </section>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UnSubscribe);
