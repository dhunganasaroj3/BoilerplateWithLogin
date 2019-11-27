/**
 * Created by lakhe on 11/19/17.
 */

import jwtDecode from 'jwt-decode';

const getUserObject = () => {
	const token = window.localStorage.getItem('token');
	if (token) {
		try {
			const decoded = jwtDecode(token);
			if (
				typeof decoded === 'object' &&
				decoded.hasOwnProperty('user') &&
				decoded.hasOwnProperty('exp') &&
				decoded.exp > Date.now() / 1000
			) {
				const userToken = Object.assign(
					{},
					{
						success: true,
						token,
						userInfo: decoded.user,
					},
				);
				return userToken.userInfo;
			}
		} catch (e) {
			return {};
		}
	}
	return {};
};

export default getUserObject;
