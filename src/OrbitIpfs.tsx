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

function App() {
  const [msg, setMsg] = useState<string[]>([]);

  useEffect(() => {

    const openOrbit = async () => {
      const ipfs = await IPFS.create(ipfsOptions);
      console.log(ipfs)
      const orbitdb = await OrbitDB.createInstance(ipfs);

      console.log("orbitdb create");

      if (window) {
        (window as any).orbitdb = orbitdb;
      }

      for (let i = 1; i < 3000; i++) {
        const store = await orbitdb.open(`store-db-${i}`, {
          create: true,
          type: "feed",
        });
        await store.load();
        console.log(`Opened ${i} db `);
        msg.push(`Opened ${i} db: ${store.id}`);
        setMsg([...msg]);
      }
  
    }

    openOrbit().catch(err => console.error(err))
  }, []);


  return (
    <div className="App">
      {`Orbit db conn:`}
      {msg.map((x) => (
        <div key={x}>{x}</div>
      ))}
    </div>
  );
}

export default App;
