import React, { useEffect, useState } from "react";
import "./App.css";

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

// Create IPFS instance
const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

type Orbit = {
  orbitdb: any
  db: any
}

type Message = {
  hash: string
  value: object
}

export function HelloOrbit({ orbitdb, db }: Orbit) {
  const [ hashes, setHashes ] = useState<string[]>([])
  const [ messages, setMessages ] = useState<Message[]>([])

  // useEffect(() => {
  //   reloadMessages()
  // }, [ hashes.length ])

  const reloadMessages = () => {
    const allMessages = db.iterator({ limit: -1, reverse: true })
      .collect()
      .map((e: any) => {
        // console.log('e', e)
        return {
          hash: e.hash,
          value: e.payload.value
        }
      })

    setMessages(allMessages)
  }

  const addToLog = async () => {
    const msg = { name: 'Oleh at ' + new Date().toLocaleString() }
    const hash = await db.add(msg, { pin: true })
    console.log('Added to OrbitDB log under hash:', hash)

    const newHashes = hashes.concat(hash)
    console.log('New hashes:', newHashes)

    setHashes(newHashes)

    reloadMessages()
  }

  return <>
    <div>Hashes count: {hashes.length}</div>
    <div><button onClick={addToLog}>Add to log</button></div>
    <div><ol>{messages.map(({ hash, value }) =>
      <li key={hash}>
        <code>{JSON.stringify(value)}</code>
        <span style={{ color: 'grey' }}> • Hash: <code>{hash}</code></span>
      </li>
    )}</ol></div>
  </>
}

export function OrbitIpfs() {
  const [ orbit, setOrbit ] = useState<Orbit>()

  useEffect(() => {
    async function initOrbitDB() {
      // Oleh's pub key: 
      // 3044022022b77f26a744e429c0ae88c66215038190a5114d2e05e44b96af72b77bc43a4b02206d73182b74d40e11690af11afe95d0fa372287b13d754c92ff98c7254eaf6890

      // Oleh's id:
      // 03c4097f9403cd349a867455fa80272171fbb20a604e8a572aff8d30ac073a0b7b
      const ipfs = await IPFS.create(ipfsOptions);
      const orbitdb = await OrbitDB.createInstance(ipfs)
      // const db = await orbitdb.log('hello') // this works!

      // const peerId = '03c4097f9403cd349a867455fa80272171fbb20a604e8a572aff8d30ac073a0b7b'

      // const orbitdbAddress = '/orbitdb/zdpuAm1NMQu9PdB2momKYNJVd5M4uaW66T5zLat57QFzzh2GN/user.posts'
      const orbitdbAddress = "/orbitdb/zdpuAymLjtDCCpWFVesevFos7fxuM3zFFZZScFrQhufLbPjvb/user.posts5"
      const db = await orbitdb.open(orbitdbAddress, {
        // create: true,
        type: 'eventlog',
        replicate: true,
      })

      const id2 = '020a7d38d293dcac543896c8e7a00a3060524d38c28ede9bfd54b183a0961bdbaa'
      // const pubKey2 = '04017de8cf04aa7c09b8c9b52ba546105a8d3a1c40d6a4e76ca42832e03b4339fe9b279ac39c699a069e8b749a620693fcf1164660831a40eb5346787e61bdf6a6'
      // await db.access.grant('write', id2)

      // Doesn't work
      // const db = await orbitdb.create('user.posts5', 'eventlog', {
      //   accessController: {
      //     write: [
      //       '*'
      //       // Give access to ourselves
      //       // orbitdb.identity.id,
      //       // // Give access to the second peer
      //       // id2
      //     ]
      //   },
      // })

      await db.load()
      // database is now ready to be queried

      setOrbit({ orbitdb, db })
      if (window) {
        (window as any).orbitdb = orbitdb;
        (window as any).db = db;
        // console.log('HINT: See window.orbitdb and window.db')
      }
      console.log('orbitdb.identity:', orbitdb.identity)
      console.log('OrbitDB db:', db)
    }
    initOrbitDB()
  }, [ false ])

  const status = orbit
    ? <b style={{ color: 'green' }}>READY</b>
    : <em style={{ color: 'red' }}>Connecting...</em>

  return <>
    <div>OrbitDB: {status}</div>
    {orbit && <HelloOrbit {...orbit} />}
  </>
}

export default OrbitIpfs;
