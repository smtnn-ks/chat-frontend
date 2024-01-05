import { Message, UserInfo } from '../types'

// NOTE: On signin all previous data will be lost

export function onSignin(id: string, privateKey: CryptoKey): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('db', 2)

    request.onerror = (event) => reject(event)

    request.onupgradeneeded = () => {
      const db = request.result

      db.createObjectStore('key', { keyPath: 'id' })
      db.createObjectStore('users', { keyPath: 'id' })
      db.createObjectStore('messages', { keyPath: 'id' }).createIndex(
        'message_with',
        'with',
        { unique: false },
      )
    }

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(
        ['key', 'users', 'messages'],
        'readwrite',
      )
      const store = transaction.objectStore('key')
      store.clear().onsuccess = () => {
        store.put({ id, privateKey })
      }
      transaction.objectStore('users').clear()
      transaction.objectStore('messages').clear()

      transaction.onerror = (event) => reject(event)

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }
    }
  })
}

export function fetchUsers(): Promise<UserInfo[]> {
  return new Promise<UserInfo[]>((resolve, reject) => {
    const request = indexedDB.open('db')

    request.onerror = (event) => reject(event)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction('users', 'readonly')
      const store = transaction.objectStore('users')
      const getOperation = store.getAll()

      getOperation.onerror = (event) => reject(event)

      transaction.oncomplete = () => {
        db.close()
        resolve(getOperation.result)
      }
    }
  })
}

export function putUser(userInfo: UserInfo | UserInfo[]) {
  const request = indexedDB.open('db')

  request.onerror = (event) => console.error(event)

  request.onsuccess = () => {
    const db = request.result
    const transaction = db.transaction('users', 'readwrite')
    const store = transaction.objectStore('users')

    if (userInfo instanceof Array) userInfo.forEach((usr) => store.put(usr))
    else store.put(userInfo)

    transaction.oncomplete = () => {
      db.close()
    }
  }
}

export function getMessages(userId: string) {
  return new Promise<Message[]>((resolve, reject) => {
    const request = indexedDB.open('db')

    request.onerror = (event) => reject(event)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction('messages', 'readonly')
      const store = transaction.objectStore('messages')
      const index = store.index('message_with')
      const getOperation = index.getAll(userId)

      getOperation.onerror = (event) => reject(event)

      getOperation.onsuccess = () => {
        db.close()
        const sorted: Message[] = getOperation.result.sort(
          (a: Message, b: Message) => a.time - b.time,
        )
        resolve(sorted)
      }
    }
  })
}

export function getPrivateKey(userId: string) {
  return new Promise<CryptoKey>((resolve, reject) => {
    const request = indexedDB.open('db')

    request.onerror = (event) => reject(event)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction('key', 'readonly')
      const store = transaction.objectStore('key')
      const getOperation = store.get(userId)

      getOperation.onerror = (event) => reject(event)

      getOperation.onsuccess = () => {
        const privateKey = getOperation.result.privateKey
        if (privateKey instanceof CryptoKey) {
          resolve(privateKey)
        } else {
          reject('Private key is not instance of CryptoKey')
        }
      }
    }
  })
}

export function putMessage(message: Message | Message[]) {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('db')

    request.onerror = (event) => reject(event)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction('messages', 'readwrite')
      const store = transaction.objectStore('messages')

      if (message instanceof Array) message.forEach((m) => store.put(m))
      else store.put(message)

      transaction.onerror = (event) => reject(event)

      transaction.oncomplete = () => {
        db.close()
        console.log('MESSAGE SUCCESSFULLY SAVED TO DATABASE')
        resolve()
      }
    }
  })
}
