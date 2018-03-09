import openSocket from 'socket.io-client';
import { request, config } from 'utils'

const { api, SOCKET_URL } = config
const { user, userLogout, userLogin } = api

var socket;

export async function login (params) {
  return request({
    url: userLogin,
    method: 'post',
    data: params,
  })
}

export async function logout (params) {
  return request({
    url: userLogout,
    method: 'get',
    data: params,
  })
}

export async function query (params) {
  return request({
    url: user.replace('/:id', ''),
    method: 'get',
    data: params,
  })
}

export function connectSocket (options={}) {
  socket = openSocket(SOCKET_URL, options)
  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('connected to socket.io '+SOCKET_URL)
      resolve(socket)
    })
  })
}

export function disconnectSocket (options={}) {
  socket = openSocket(SOCKET_URL, options)
  return new Promise((resolve) => {
    socket.on('disconnect', () => {
      console.log('disconnect from socket.io ')
      resolve(socket)
    })
  })
}

export function reconnectSocket (options={}) {
  options.transports = ['polling', 'websocket']
  // options.transportOptions = {
  //   polling: {
  //     extraHeaders: {
  //       token: localStorage.getItem('token') || null
  //     },
  //   },
  //   'websocket': {
  //     extraHeaders: {
  //       token: localStorage.getItem('token') || null
  //     },
  //   }
  // }
  socket = openSocket(SOCKET_URL, options)
  return new Promise((resolve) => {
    socket.on('reconnect_attempt', () => {
      console.log('reconnect to socket.io '+SOCKET_URL)
      resolve(socket)
    })
  })
}
