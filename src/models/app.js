/* global window */
/* global document */
/* global location */
/* global localStorage */
/* eslint no-restricted-globals: ["error", "event"] */

import { routerRedux } from 'dva/router'
import { delay } from 'redux-saga'
import { parse } from 'qs'
import config from 'config'
import { EnumRoleType } from 'enums'
import {
  query, logout,
  connectSocket,
  disconnectSocket,
  reconnectSocket,
} from 'services/app'
import * as menusService from 'services/menus'
import queryString from 'query-string'
import { subscribe } from '../services/channels'

const { prefix } = config

export default {
  namespace: 'app',
  state: {
    user: {},
    permissions: {
      visit: [],
    },
    menu: [
      {
        id: 1,
        icon: 'laptop',
        name: 'Dashboard',
        router: '/dashboard',
      },
    ],
    menuPopoverVisible: false,
    siderFold: window.localStorage.getItem(`${prefix}siderFold`) === 'true',
    darkTheme: window.localStorage.getItem(`${prefix}darkTheme`) === 'true',
    isNavbar: document.body.clientWidth < 769,
    navOpenKeys: JSON.parse(window.localStorage.getItem(`${prefix}navOpenKeys`)) || [],
    locationPathname: '',
    locationQuery: {},
    time: Date.now(),
    serverStatus: 'unknown',
  },
  subscriptions: {
    setupHistory ({ dispatch, history }) {
      history.listen((location) => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: queryString.parse(location.search),
          },
        })
      })
    },
    setup ({ dispatch }) {
      dispatch({ type: 'query', payload: { dispatch } })
      let tid
      window.onresize = () => {
        clearTimeout(tid)
        tid = setTimeout(() => {
          dispatch({ type: 'changeNavbar' })
        }, 300)
      }
    },
  },
  effects: {

    * query ({
      payload,
    }, { call, put, select }) {
      const { success, user } = yield call(query, payload)
      console.log('user: ', user)
      const { locationPathname } = yield select(_ => _.app)
      if (success && user) {
        const { list } = yield call(menusService.query)
        const { permissions } = user
        let menu = list
        if (permissions.role === EnumRoleType.ADMIN || permissions.role === EnumRoleType.DEVELOPER) {
          permissions.visit = list.map(item => item.id)
        } else {
          menu = list.filter((item) => {
            const cases = [
              permissions.visit.includes(item.id),
              item.mpid ? permissions.visit.includes(item.mpid) || item.mpid === '-1' : true,
              item.bpid ? permissions.visit.includes(item.bpid) : true,
            ]
            return cases.every(_ => _)
          })
        }

        yield put({
          type: 'updateState',
          payload: {
            user,
            permissions,
            menu,
          },
        });
        yield put({
          type: 'handleIO',
          payload: { user }
        })
        if (location.pathname === '/' || location.pathname === '/login') {
          yield put(routerRedux.push({
            pathname: '/dashboard',
          }))
        }
      } else if (config.openPages && config.openPages.indexOf(locationPathname) < 0) {
        yield put(routerRedux.push({
          pathname: '/login',
          search: queryString.stringify({
            from: locationPathname,
          }),
        }))
      }
    },

    * logout ({
      payload,
    }, { call, put }) {
      localStorage.removeItem('token')
      yield put({ type: 'query' })
      // const data = yield call(logout, parse(payload))
      // if (data.success) {
      //   yield put({ type: 'query' })
      // } else {
      //   throw (data)
      // }
    },

    * changeNavbar (action, { put, select }) {
      const { app } = yield (select(_ => _))
      const isNavbar = document.body.clientWidth < 769
      if (isNavbar !== app.isNavbar) {
        yield put({ type: 'handleNavbar', payload: isNavbar })
      }
    },

    * handleIO({ type, payload}, {
      call, put, fork, take, cancel, cancelled, race
    }) {

       function* listenDisconnectSaga () {
        while (true) {
          yield call(disconnectSocket);
          yield put({type: 'serverStatue', payload: 'off' });
        }
      }

      function* listenConnectSaga (opt) {
        while (true) {
          yield call(reconnectSocket, opt);
          yield put({
            type: 'serverStatus', payload: 'reconnect'
          })
        }
      }

      function* read(socket) {
        const channel = yield call(subscribe, socket );
        try {
          while (true) {
            const action = yield take(channel)
            yield put(action)
          }
        } catch (err) {

        }
      }

      function* write(soc) {
        try {
          while (true) {
            const { payload } = yield take(`test/test`);
            soc.emit('message', '');
          }
        } catch (err) {

        }
      }

      function* handleProcess (soc, opt) {
        yield fork(read, soc)
        yield fork(write, soc)
        // yield fork(listenDisconnectSaga)
        // yield fork(listenConnectSaga, opt)
      }

      let socket = null;
      try {
        const defaultOptions = {
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 2 * 1000,
          reconnectionDelayMax: 20 * 1000,
          autoConnect: true,
          transports: ['websocket'],
          rejectUnauthorized: true,
          query: {
            token: localStorage.getItem('token') || null
          }
        }
        // const socket = await connectSocket(defaultOptions)
        // yield put({type: CHANNEL_ON});
        yield put({
          type: '@@DVA_LOADING/HIDE',
          payload: { namespace: 'app', actionType: 'app/handleIO' }
        })

        const {connected, timeout} = yield race({
          connected: call(connectSocket, defaultOptions),
          timeout: delay(2000),
        })

        if (timeout) {
          yield put({ type: 'serverStatus', payload: 'off' })
        }
        // socket = yield call(connectSocket, defaultOptions)
        socket = connected
        const task = yield fork(handleProcess, socket, defaultOptions)
        yield put({ type: 'serverStatus', payload: 'on' })
        yield take(`logout`)
        yield cancel(task)
        yield put({ type: 'serverStatus', payload: 'unknown' })
      } catch (err) {
      } finally {
        if (yield cancelled() && socket !== null) {
          socket.disconnect(true)
        }
      }
    }
  },
  reducers: {
    updateState (state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },

    switchSider (state) {
      window.localStorage.setItem(`${prefix}siderFold`, !state.siderFold)
      return {
        ...state,
        siderFold: !state.siderFold,
      }
    },

    switchTheme (state) {
      window.localStorage.setItem(`${prefix}darkTheme`, !state.darkTheme)
      return {
        ...state,
        darkTheme: !state.darkTheme,
      }
    },

    switchMenuPopver (state) {
      return {
        ...state,
        menuPopoverVisible: !state.menuPopoverVisible,
      }
    },

    handleNavbar (state, { payload }) {
      return {
        ...state,
        isNavbar: payload,
      }
    },

    handleNavOpenKeys (state, { payload: navOpenKeys }) {
      return {
        ...state,
        ...navOpenKeys,
      }
    },

    updateTime (state, { payload }) {
      return {
        ...state,
        time: payload.time,
      }
    },
    serverStatus (state, { payload }) {
      return {
        ...state,
        serverStatus: payload,
      }
    }
  },
}
