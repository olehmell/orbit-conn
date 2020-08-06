import React, { useEffect, useState } from "react";
import "./App.css";
import OrbitDB from "orbit-db";

const IpfsClient = require("ipfs-http-client");

const ipfs = IpfsClient("/ip4/127.0.0.1/tcp/5001");

function App() {
  const [msg, setMsg] = useState<string[]>([]);

  useEffect(() => {
    const openOrbit = async () => {
      const orbitdb = await OrbitDB.createInstance(ipfs);
      console.log("orbitdb create");

      if (window) {
        (window as any).orbitdb = orbitdb;
      }

      for (let i = 1; i < 30; i++) {
        const store = await orbitdb.open(`store-db-${i}`, {
          create: true,
          type: "feed",
        });
        await store.load();
        console.log(`Opened ${i} db `);
        msg.push(`Opened ${i} db: ${store.id}`);
        setMsg([...msg]);
      }
    };

    openOrbit().catch((err) => console.error(err));
  }, [false]);

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
