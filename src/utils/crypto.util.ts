import { IncomingMessage } from '../types'
import SERVICE_PUBLIC_KEY from '../service-public-key'
import { getPrivateKey } from '.'
const { subtle } = window.crypto

export async function importPrivateKey(key: string) {
  const pemString = atob(key)

  const bytes = new Uint8Array(pemString.length)
  for (let i = 0; i < pemString.length; i++) {
    bytes[i] = pemString.charCodeAt(i)
  }
  const pemBuffer = bytes.buffer

  const resultKey = await subtle.importKey(
    'pkcs8',
    pemBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt'],
  )
  return resultKey
}

export async function importPublicKey(key: string) {
  const pemString = atob(key)

  const bytes = new Uint8Array(pemString.length)
  for (let i = 0; i < pemString.length; i++) {
    bytes[i] = pemString.charCodeAt(i)
  }
  const pemBuffer = bytes.buffer

  const resultKey = await subtle.importKey(
    'spki',
    pemBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt'],
  )
  return resultKey
}

export async function importServicePublicKey() {
  const servicePublicKey = _base64ToArrayBuffer(SERVICE_PUBLIC_KEY)

  const resultKey = await subtle.importKey(
    'spki',
    servicePublicKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-512',
    },
    false,
    ['verify'],
  )
  return resultKey
}

function _arrayBufferToBase64(buffer: ArrayBufferLike) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function _arrayBufferToUtf8(buffer: ArrayBufferLike) {
  return new TextDecoder().decode(buffer)
}

function _stringToArrayBuffer(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

function _base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

export async function encryptMessage(message: string, publicKey: CryptoKey) {
  const key = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ])
  const iv = window.crypto.getRandomValues(new Uint8Array(32))
  const messageBuffer = new TextEncoder().encode(message)
  const encBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    messageBuffer,
  )
  const content = _arrayBufferToBase64(encBuffer)

  const keyBuffer = await subtle.exportKey('raw', key)
  const infoBuffer = Uint8Array.from([...new Uint8Array(keyBuffer), ...iv])

  const encInfo = await subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    infoBuffer,
  )
  const info = _arrayBufferToBase64(encInfo)
  return { content, info }
}

export class MessageHandler {
  servicePublicKey: CryptoKey
  privateKey: CryptoKey
  constructor(servicePublicKey: CryptoKey, privateKey: CryptoKey) {
    this.servicePublicKey = servicePublicKey
    this.privateKey = privateKey
  }

  private verify(message: {
    userId: string
    content: string
    info: string
    signature: string
  }) {
    return new Promise<{ userId: string; content: string; info: string }>(
      (resolve, reject) => {
        const contentBuffer = _stringToArrayBuffer(message.content)
        const signatureBuffer = _base64ToArrayBuffer(message.signature)
        subtle
          .verify(
            'RSASSA-PKCS1-v1_5',
            this.servicePublicKey,
            signatureBuffer,
            contentBuffer,
          )
          .then((isVerified) => {
            if (isVerified) {
              resolve({
                userId: message.userId,
                content: message.content,
                info: message.info,
              })
            } else {
              reject('Could not verify the message')
            }
          })
          .catch((e) => {
            console.error('ERROR :: MessageHandler.verify ::', e)
            reject(e)
          })
      },
    )
  }

  private decryptMessage(message: {
    userId: string
    content: string
    info: string
  }) {
    return new Promise<IncomingMessage>((resolve, reject) => {
      const infoBuffer = _base64ToArrayBuffer(message.info)
      subtle
        .decrypt({ name: 'RSA-OAEP' }, this.privateKey, infoBuffer)
        .then((decInfoBuffer) => {
          const keyRaw = decInfoBuffer.slice(0, 32)
          const iv = decInfoBuffer.slice(32, decInfoBuffer.byteLength)
          const messageBuffer = _base64ToArrayBuffer(message.content)
          subtle
            .importKey('raw', keyRaw, { name: 'AES-GCM' }, false, ['decrypt'])
            .then((key) => {
              subtle
                .decrypt({ name: 'AES-GCM', iv }, key, messageBuffer)
                .then((messageBuffer) => {
                  const messageRaw = _arrayBufferToUtf8(messageBuffer)
                  const message = JSON.parse(messageRaw)
                  resolve(message as IncomingMessage)
                })
                .catch((e) => {
                  console.error('COULD NOT DECRYPT MESSAGE')
                  reject(e)
                })
            })
            .catch((e) => {
              console.error('COULD NOT IMPORT AES KEY')
              reject(e)
            })
        })
        .catch((e) => {
          console.error('COULD NOT DECRYPT INFO')
          reject(e)
        })
    })
  }

  async decrypt(message: {
    userId: string
    content: string
    info: string
    signature: string
  }) {
    const verifiedMessage = await this.verify(message)
    return this.decryptMessage(verifiedMessage)
  }
}

export async function getMessageHandlerInstance(userId: string) {
  const props = await Promise.all([
    importServicePublicKey(),
    getPrivateKey(userId),
  ])
  return new MessageHandler(...props)
}
