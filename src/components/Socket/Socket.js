/*
global localStorage
 */
import React from 'react';
import SocketIO from 'socket.io-client';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { withRouter } from 'dva/router'

import { config } from 'utils'

const { SOCKET_URL } = config

class Socket extends React.Component {

  getChildContext () {
    return { socket: this.socket };
  }

  constructor (props, context) {
    super(props, context);
    this.socket = SocketIO(SOCKET_URL, this.mergeOptions(props.options));
    this.socket.status = 'initialized'
    this.unsubscribelisteners = this.initListeners()
  }

  onConnect () {
    const handler = (e) => {
      console.log('connect '+ SOCKET_URL)
      this.socket.status = 'connected'
      this.props.dispatch({ type: 'app/serverStatus', payload: 'on' })
    }
    this.socket.on('connect', handler)
    return () => this.socket.off('connect', handler.bind(this))
  }

  onDisconnect(cb) {
    const handler = (e) => {
      this.socket.status = 'disconnected'
      this.props.dispatch({ type: 'app/serverStatus', payload: 'off' })

    }
    this.socket.on('disconnect', handler)
    return () => this.socket.off('disconnect', handler)
  }

  onReconnectAttempt(cb) {
    const handler = (e) => {
      this.socket.status = 'connected'
      this.props.dispatch({ type: 'app/serverStatus', payload: 'on' })

    }
    this.socket.on('reconnect_attempt', handler)
    return () => this.socket.off('reconnect_attempt', handler)
  }

  onReconnecting(cb) {
    const handler = (e) => {
      this.socket.status = 'reconnecting'
      this.props.dispatch({ type: 'app/serverStatus', payload: 'reconnecting' })
    }
    this.socket.on('reconnecting', handler)
    return () => this.socket.off('reconnecting', handler)
  }

  onReconnect(cb) {
    const handler = (e) => {
      this.socket.status = 'connected'
      this.props.dispatch({ type: 'app/serverStatus', payload: 'on' })

    }
    this.socket.on('reconnect', handler)
    return () => this.socket.off('reconnect', handler)
  }

  onError (cb) {

    const handler = (e) => {
      this.socket.status = 'failed'
      this.props.dispatch({ type: 'app/serverStatus', payload: 'off' })

    }
    this.socket.on('error', handler)
    return () => this.socket.off('error', handler)
  }

  onReconnectFailed (cb) {
    const handler = (e) => {
      this.socket.status = 'failed'
      this.props.dispatch({ type: 'serverStatus', payload: 'off' })

    }
    this.socket.on('reconnect_failed', handler)
    return () => this.socket.off('reconnect_failed', handler)
  }

  initListeners () {
    this.unsubConnect = this.onConnect();
    this.unsubDisconnect = this.onDisconnect();
    this.unsubReconnectAttempt = this.onReconnectAttempt();
    this.unsubReconnecting = this.onReconnecting();
    this.unsubReconnect = this.onReconnect();
    this.unsubReconnectFailed = this.onReconnectFailed();
    this.unsubError = this.onError();
    return () => {
      this.unsubConnect()
      this.unsubDisconnect()
      this.unsubReconnectAttempt()
      this.unsubReconnecting()
      this.unsubReconnect()
      this.unsubReconnectFailed()
      this.unsubError()
      this.socket.disconnect(true)
      this.socket = null
    }
  }
  mergeOptions (options = {}) {
    const defaultOptions = {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2 * 1000,
      reconnectionDelayMax: 20 * 1000,
      autoConnect: true,
      transports: ['websocket'],
      rejectUnauthorized: true,
      query: {
        token: localStorage.getItem('token') || null,
      },
    }
    return { ...defaultOptions, ...options };
  }

  componentWillUnmount () {
    this.unsubscribelisteners()
  }
  render () {
    return React.Children.only(this.props.children)
  }
}

Socket.propTypes = {
  options: PropTypes.object,
  children: PropTypes.element.isRequired,
}

Socket.childContextTypes = {
  socket: PropTypes.object,
}

export default connect(null)(Socket)
// export default Socket
