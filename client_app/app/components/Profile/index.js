import React from 'react';
import styles from './styles.css';
import Routes from './Routes';
import TabbedView from '../TabbedView';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

class Profile extends React.Component {
  static propTypes = {
    tabs: PropTypes.array.isRequired,
  };
  state = {
    tabs: [],
  };
  componentWillMount() {
    this.setState({ tabs: this.props.tabs });
  }
  render() {
    return (
      <div>
        <TabbedView items={this.state.tabs} Link={NavLink} />
        <Routes />
      </div>
    );
  }
}

export default Profile;
