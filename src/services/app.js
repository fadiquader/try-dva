import openSocket from 'socket.io-client';
import { request, config } from 'utils'

const { api, SOCKET_URL } = config
const { user, userLogout, userLogin } = api

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

export function createSocket (options={}) {
  const socket = openSocket(SOCKET_URL, options)
  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('connected to socket.io '+SOCKET_URL)
      resolve(socket)
    })
    socket.on('error', () => {
      resolve(null)
    })
  })
}
