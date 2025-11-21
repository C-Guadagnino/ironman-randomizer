//	src/components/portrait-shuffler.tsx
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

type PortraitShufflerProps = {
  title: string;
  portraits: string[];
};

const ROW_SIZES = [5, 4, 3, 2];

const PortraitShuffler: React.FC<PortraitShufflerProps> = ({
  title,
  portraits,
}) => {
  const [order, setOrder] = useState<number[]>(() =>
    portraits.map((_, index) => index)
  );

  const [previousOrder, setPreviousOrder] = useState<number[] | null>(null);

  const [greyed, setGreyed] = useState<boolean[]>(() =>
    portraits.map(() => false)
  );

  const handleShuffleClick = async () => {
    if (portraits.length === 0) {
      return;
    }

    setPreviousOrder(order);

    const seed: number = Date.now() >>> 0;
    try {
      const indices = await invoke<number[]>('shuffle_characters', {
        len: portraits.length,
        seed: seed,
      });
      setOrder(indices);
    } catch (err) {
      console.error('Failed to shuffle:', err);
    }
  };

  const handleUndoClick = () => {
    if (!previousOrder) {
      return;
    }

    setOrder(previousOrder);
    setPreviousOrder(null);
  };

  const handlePortraitClick = (portraitIndex: number) => {
    setGreyed((prev) => {
      const next = [...prev];
      next[portraitIndex] = !next[portraitIndex];
      return next;
    });
  };

  //	Build rows according to the 5/4/3/2 "pyramid" pattern.
  const rows: number[][] = [];
  let cursor = 0;

  for (const size of ROW_SIZES) {
    const slice = order.slice(cursor, cursor + size);
    if (slice.length > 0) {
      rows.push(slice);
    }
    cursor += size;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100%',
        padding: '16px',
        boxSizing: 'border-box',
        backgroundColor: '#111111',
        borderRadius: '12px',
        gap: '12px',
      }}
    >
      <h2
        style={{
          margin: 0,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={handleShuffleClick}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Randomize
        </button>

        <button
          type="button"
          onClick={handleUndoClick}
          disabled={!previousOrder}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            cursor: previousOrder ? 'pointer' : 'default',
            opacity: previousOrder ? 1 : 0.5,
          }}
        >
          Undo
        </button>
      </div>

      {/*	Rows container:
				- width: auto → shrink to content
				- alignSelf: center → center the whole pyramid within this half
			*/}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: '8px',
          alignSelf: 'center',
        }}
      >
        {rows.map((row, rowIndex) => {
          const indent = rowIndex * 45;

          return (
            <div
              key={`${title}-row-${rowIndex}`}
              style={{
                display: 'flex',
                gap: '12px',
                marginLeft: indent,
              }}
            >
              {row.map((i) => (
                <img
                  key={`${title}-${i}`}
                  src={portraits[i]}
                  onClick={() => handlePortraitClick(i)}
                  style={{
                    width: '96px',
                    height: '96px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #444444',
                    filter: greyed[i] ? 'grayscale(100%)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortraitShuffler;
