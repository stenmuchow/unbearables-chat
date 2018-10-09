// @flow
import { put, takeLatest, call, select, take } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import { push } from 'connected-react-router';
import appActions from '../app/app.action';
import rsf from '../rsf';
import {
  USER_LOGIN,
  USER_SIGNUP,
  USER_LOGOUT,
  USER_UPDATE_INFO,
  USER_UPDATE_LAST_SEEN,
  USER_START_SYNC,
  USER_RESET_PASSWORD,
} from './user.action';
import actions from './user.action';
import chatActions from '../chat/chat.action';
import errorActions from '../error/error.action';
import { memberPath } from '../chat/chat.saga';
import { getUserData } from './user.reducer';

function* userSync() {
  const channel = yield call(rsf.auth.channel);

  while (true) {
    const { user } = yield take(channel);
    if (user) {
      yield put(actions.userUpdate(user));
    } else {
      //console.log(error);
    }
  }
}

function* userLogin({ email, password }): Saga<void> {
  try {
    yield put(actions.userLoginStarted());
    const { user } = yield call(
      rsf.auth.signInWithEmailAndPassword,
      email,
      password
    );
    yield put(actions.userLoginSuccess(user));
    yield put(appActions.setAppStatusInitialized(user.emailVerified));
    yield put(chatActions.initialize());
    yield put(push('/chat'));
  } catch (error) {
    yield put(
      errorActions.errorLoginFailure('Username or password is incorrect.')
    );
  }
}

function* userSignup({ username, email, password }): Saga<void> {
  try {
    yield put(actions.userSignupStarted());
    const data = yield call(
      rsf.auth.createUserWithEmailAndPassword,
      email,
      password
    );
    yield call([data.user, data.user.updateProfile], {
      displayName: username,
    });
    yield put(actions.userLoginSuccess(data.user));
    yield put(chatActions.initialize());
    yield put(push('/chat'));
  } catch (error) {
    yield put(
      errorActions.errorSignupFailure('Something seems to have gone wrong...')
    );
  }
}

function* userLogout() {
  try {
    yield call(rsf.auth.signOut);
    yield put(actions.userLogoutSuccess());
    yield put(chatActions.chatLogout());
    yield put(push('/login'));
  } catch (e) {
    console.error(e);
  }
}

function* userUpdateInfo({ username }) {
  try {
    const user = yield select(getUserData);
    const userData = {
      displayName: username,
    };

    yield put(
      actions.userLoginSuccess(
        Object.assign({}, user, {
          displayName: username,
        })
      )
    );
    yield call(rsf.auth.updateProfile, userData);
  } catch (e) {
    console.error(e);
  }
}

function* userUpdateLastSeen() {
  try {
    const user = yield select(getUserData);
    const userPath = `${memberPath}${user.uid}`;
    const ref = rsf.app.database().ref(userPath);
    const rosterUpdate = {
      lastSeen: Date.now(),
    };
    yield call([ref, ref.update], rosterUpdate);
  } catch (e) {
    console.error(e);
  }
}

function* userResetPassword({ email }) {
  try {
    yield call(rsf.auth.sendPasswordResetEmail, email);
    yield put(push('/login'));
  } catch (error) {
    yield put(
      errorActions.errorResetPasswordFailure(
        'Something seems to have gone wrong...'
      )
    );
  }
}

export function* watchUserUpdateLastSeen(): Saga<void> {
  yield takeLatest(USER_UPDATE_LAST_SEEN, userUpdateLastSeen);
}

export function* watchUserUpdateInfo(): Saga<void> {
  yield takeLatest(USER_UPDATE_INFO, userUpdateInfo);
}

export function* watchUserLogout(): Saga<void> {
  yield takeLatest(USER_LOGOUT, userLogout);
}

export function* watchUserSignup(): Saga<void> {
  yield takeLatest(USER_SIGNUP, userSignup);
}

export function* watchUserLogin(): Saga<void> {
  yield takeLatest(USER_LOGIN, userLogin);
}

export function* watchUserStartSync(): Saga<void> {
  yield takeLatest(USER_START_SYNC, userSync);
}

export function* watchUserResetPassword(): Saga<void> {
  yield takeLatest(USER_RESET_PASSWORD, userResetPassword);
}

export default [
  watchUserLogin,
  watchUserSignup,
  watchUserLogout,
  watchUserUpdateInfo,
  watchUserUpdateLastSeen,
  watchUserResetPassword,
  watchUserStartSync,
];
