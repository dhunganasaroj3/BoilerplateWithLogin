const invalidTokenResponseTest = error => {
    if (error && error.status !== 401) return false;
    return !!(error && error.status === 401 &&
      error.hasOwnProperty('data') && !!error.data &&
      error.data.hasOwnProperty('isToken') &&
      error.data.isToken &&
      error.data.hasOwnProperty('success') &&
      !error.data.success &&
      error.data.hasOwnProperty('message') &&
      // error.data.message === 'Authentication Failed'
      error.data.message.length > 0
    );
  };
  
  
  export default invalidTokenResponseTest;
  