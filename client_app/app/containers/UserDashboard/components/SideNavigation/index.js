import React from 'react';
import { Link } from 'react-router-dom';
import { Sidebar, Menu, Icon } from 'semantic-ui-react';

const SideNavigation = () => (
	<Sidebar as={Menu} animation="overlay" icon="labeled" inverted vertical visible width="thin">
		<Menu.Item name="home">
			<Link to="/user/dashboard">
				<Icon name="home" /> Home
			</Link>
		</Menu.Item>
		<Menu.Item name="profile">
			<Link to="/user/dashboard/profile">
				<Icon name="home" /> Profile
			</Link>
		</Menu.Item>
	</Sidebar>
);

export default SideNavigation;
