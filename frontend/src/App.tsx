import React, { useEffect, useState } from 'react';
import init from './pkg/portrait_shuffler';
import { PORTRAITS } from './assets/portrait-constnats';
import PortraitShuffler from './components/portrait-shuffler';

const BREAKPOINT = 1120; // px; adjust as you like

const App: React.FC = () => {
  const [wasmReady, setWasmReady] = useState<boolean>(false);
  const [isVertical, setIsVertical] = useState<boolean>(false);

  //	Initialize the WASM module once when the app mounts.
  useEffect(() => {
    (async () => {
      try {
        await init();
        setWasmReady(true);
      } catch (err) {
        console.error('WASM init failed', err);
      }
    })();
  }, []);

  //	Track window size to switch between horizontal / vertical layout.
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsVertical(window.innerWidth < BREAKPOINT);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
        backgroundColor: '#181818',
        width: '100vw',
        height: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1
        style={{
          marginTop: 16,
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        Iron Man Shuffler
      </h1>

      <div
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          flex: 1,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            borderRight: isVertical ? 'none' : '1px solid #333333',
            borderBottom: isVertical ? '1px solid #333333' : 'none',
            paddingBottom: 16,
          }}
        >
          <PortraitShuffler
            title="Player 1"
            portraits={PORTRAITS}
            wasmReady={wasmReady}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingBottom: 16,
          }}
        >
          <PortraitShuffler
            title="Player 2"
            portraits={PORTRAITS}
            wasmReady={wasmReady}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
