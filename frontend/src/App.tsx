import React from 'react';
import IronManRun from './components/iron-man-run';

const App: React.FC = () => {
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
        Iron Man Randomizer
      </h1>

      <div
        style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 16px 16px',
        }}
      >
        <IronManRun />
      </div>
    </div>
  );
};

export default App;
