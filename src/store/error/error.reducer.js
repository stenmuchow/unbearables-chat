// @flow
import type { ErrorStateType, AppStoreType } from '../../types';
import {
  ERROR_LOGIN_FAILURE,
  ERROR_SIGNUP_FAILURE,
  ERROR_RESET,
  ERROR_RESET_PASSWORD_FAILURE,
  type AnyErrorActionType,
} from './error.action';

const initialState: ErrorStateType = {
  loginError: '',
  signupError: '',
  resetPasswordError: '',
};

const mapMessage = key => {
  switch (key) {
    case 'EMAIL_EXISTS': {
      return 'Email already has been used, try another one...';
    }
    default:
      return 'Something seems to have gone wrong';
  }
};

const getMessage = ({ error }) => {
  if (error.message) {
    return error.message;
  }
  error && error.errors && error.errors.length
    ? mapMessage(error.errors[0].message)
    : mapMessage(null);
};

const errorReducer = (
  state: ErrorStateType = initialState,
  action: AnyErrorActionType
): ErrorStateType => {
  switch (action.type) {
    case ERROR_LOGIN_FAILURE:
      return {
        ...initialState,
        loginError: action.message,
      };
    case ERROR_SIGNUP_FAILURE:
      return {
        ...initialState,
        signupError: getMessage(action),
      };
    case ERROR_RESET:
      return {
        ...initialState,
      };
    case ERROR_RESET_PASSWORD_FAILURE:
      return {
        ...initialState,
        resetPasswordError: action.message,
      };
    default:
      return state;
  }
};

export default errorReducer;

export const getError = (state: AppStoreType) => state && state.error;
