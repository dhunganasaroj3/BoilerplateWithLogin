
const passwordHelper = password => {
    let errors = {};
  
    if (!/[0-9]/.test(password)) {
      errors = Object.assign({}, errors, { numberError: true })
    }
    if (!/[a-z]/.test(password)) {
      errors = Object.assign({}, errors, { lowercaseError: true })
    }
    if (!/[A-Z]/.test(password)) {
      errors = Object.assign({}, errors, { uppercaseError: true })
    }
    if (!/[!@#$&*]/.test(password)) {
      errors = Object.assign({}, errors, { specialCharactersError: true })
    }
    if (!/.{8}/.test(password)) {
      errors = Object.assign({}, errors, { lengthError: true })
    }
  
    return errors;
  };
  
  export default passwordHelper;
  
  