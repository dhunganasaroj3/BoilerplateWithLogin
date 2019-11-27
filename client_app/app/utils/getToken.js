const getToken = () => sessionStorage.getItem('token') ? sessionStorage.getItem('token') : localStorage.getItem('token');

export default getToken;
