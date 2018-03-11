/* global localStorage */

import openSocket from 'socket.io-client';
import { config } from 'utils'

const { SOCKET_URL } = config

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

var socket = openSocket(SOCKET_URL, defaultOptions)

export function getSocket() {
  return new Promise((resolve) => {
    resolve(socket)
  })
}

export function onConnect(cb) {
  const handler = (e) => {
    console.log('connected to socket.io '+SOCKET_URL)
    cb(e)
  }
  socket.on('connect', handler)
  return () => socket.off('connect', handler)
}


export function onReconnectAttempt(cb) {
  const handler = (e) => {
    cb(e)
  }
  socket.on('reconnect_attempt', handler)
  return () => socket.off('reconnect_attempt', handler)
}

export function onConnecting(cb) {
  const handler = (e) => {
    cb(e)
  }
  socket.on('connecting', handler)
  return () => socket.off('connecting', handler)
}

export function onDisconnect(cb) {
  const handler = (e) => {
    cb(e)
  }
  socket.on('disconnect', handler)
  return () => socket.off('disconnect', handler)
}

export function forceDisconnect() {
  socket.disconnect(true)
}

export function forceConnect() {
  socket.connect(true)
}

export function updateTime (cb) {
  const handler = (e) => {
    cb(e)
  }
  socket.on('updateTime', handler)
  return () => socket.off('updateTime', handler)
}
