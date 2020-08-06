import React, { useEffect, useState } from "react";
import "./App.css";

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')


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

  useEffect(() => {
    reloadMessages()
  }, [])

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
    const msg = { name: `${window.navigator.platform} at ` + new Date().toLocaleString() }
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
      // Create IPFS instance
    async function initOrbitDB() {

      const ipfs = new IPFS({
        repo: '/orbitdb/examples/browser/new/ipfs/0.33.1',
        start: true,
        preload: { 
          enabled: false
        },
        EXPERIMENTAL: {
          pubsub: true,
        },
        config: {
          Addresses: {
            Swarm: [
              // Use IPFS dev signal server
              // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
              '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
              // Use local signal server
              // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
            ]
          },
        }
      })
    
      ipfs.on('error', (e: any) => console.error(e))
      ipfs.on('ready', async () => {
        const orbitdb = await OrbitDB.createInstance(ipfs)

        console.log('orbitdb', orbitdb)

        const orbitdbAddress = "/orbitdb/zdpuAp8eU8GLQNCcudvuaK34fa15sZw2tRVXLitQvJ4oZBg5G/user.posts7"
        
        const db = await orbitdb.open(orbitdbAddress, {
          create: true,
          type: 'eventlog',
          replicate: true,
          accessController: {
            write: '*',
          }
        })

        // const db = await orbitdb.create('user.posts7', 'eventlog', {
        //   accessController: {
        //     write: [
        //       '*'
        //     // // Give access to ourselves
        //     // orbitdb.identity.id,
        //     // // Give access to the second peer
        //     // id2
        //     ]
        //   }
        // })
  
        await db.load()
  
        setOrbit({ orbitdb, db })
        if (window) {
          (window as any).orbitdb = orbitdb;
          (window as any).db = db;
          (window as any).ipfs = ipfs;
          // console.log('HINT: See window.orbitdb and window.db')
        }
        console.log('orbitdb.identity:', orbitdb.identity)
        console.log('OrbitDB db:', db)
      })

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
