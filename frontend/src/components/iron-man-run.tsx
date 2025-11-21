import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PORTRAITS } from '../assets/portrait-constnats';
import { CHARACTER_NAMES, getCharacterName } from '../assets/character-names';

interface RunState {
    run_id: number;
    queue: string[];
    completed: string[];
    failed: boolean;
    started_at_ms: number | null;
    updated_at_ms: number | null;
}

const ROW_SIZES = [5, 4, 3, 2];

const IronManRun: React.FC = () => {
    const [runState, setRunState] = useState<RunState | null>(null);
    const [loading, setLoading] = useState(true);

    // Load initial run state
    useEffect(() => {
        loadRunState();
    }, []);

    const loadRunState = async () => {
        try {
            const state = await invoke<RunState>('get_run_state');
            setRunState(state);
        } catch (err) {
            console.error('Failed to load run state:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartRun = async () => {
        setLoading(true);
        try {
            const state = await invoke<RunState>('start_run', {
                characters: CHARACTER_NAMES,
                seed: null,
            });
            setRunState(state);
        } catch (err) {
            console.error('Failed to start run:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteCharacter = async (character: string) => {
        if (!runState || runState.queue.length === 0) return;

        try {
            const state = await invoke<RunState>('complete_character', {
                character: character,
            });
            setRunState(state);
        } catch (err) {
            console.error('Failed to complete character:', err);
        }
    };

    const handleFailRun = async () => {
        if (!runState) return;

        if (!confirm('Mark this run as failed? This cannot be undone.')) {
            return;
        }

        try {
            const state = await invoke<RunState>('fail_run');
            setRunState(state);
        } catch (err) {
            console.error('Failed to fail run:', err);
        }
    };

    const handleResetRun = async () => {
        if (!runState || runState.run_id === 0) return;

        if (!confirm('Reset the current run? All progress will be lost.')) {
            return;
        }

        try {
            const state = await invoke<RunState>('reset_run');
            setRunState(state);
        } catch (err) {
            console.error('Failed to reset run:', err);
        }
    };

    const getPortraitPath = (characterName: string): string => {
        const index = CHARACTER_NAMES.indexOf(characterName);
        if (index >= 0 && index < PORTRAITS.length) {
            return PORTRAITS[index];
        }
        return PORTRAITS[0]; // Fallback
    };

    // Build display order: completed first (crossed out), then queue
    const displayCharacters: Array<{
        name: string;
        portrait: string;
        isCompleted: boolean;
        isFailed: boolean;
    }> = [];

    if (runState) {
        // Add completed characters
        runState.completed.forEach((name) => {
            displayCharacters.push({
                name,
                portrait: getPortraitPath(name),
                isCompleted: true,
                isFailed: runState.failed,
            });
        });

        // Add queued characters
        runState.queue.forEach((name) => {
            displayCharacters.push({
                name,
                portrait: getPortraitPath(name),
                isCompleted: false,
                isFailed: runState.failed,
            });
        });
    }

    // Build rows according to pyramid pattern
    const rows: typeof displayCharacters[][] = [];
    let cursor = 0;

    for (const size of ROW_SIZES) {
        const slice = displayCharacters.slice(cursor, cursor + size);
        if (slice.length > 0) {
            rows.push(slice);
        }
        cursor += size;
    }

    const hasActiveRun = runState && runState.run_id > 0;
    const progress = runState
        ? runState.completed.length + runState.queue.length > 0
            ? Math.round(
                (runState.completed.length /
                    (runState.completed.length + runState.queue.length)) *
                100
            )
            : 0
        : 0;

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    color: 'white',
                }}
            >
                Loading...
            </div>
        );
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
            <h2 style={{ margin: 0, color: 'white' }}>Iron Man Run</h2>

            {/* Controls */}
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                {!hasActiveRun ? (
                    <button
                        type="button"
                        onClick={handleStartRun}
                        style={{
                            padding: '8px 16px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                        }}
                    >
                        Start New Run
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={handleResetRun}
                            style={{
                                padding: '8px 16px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                            }}
                        >
                            Reset Run
                        </button>
                        {!runState?.failed && (
                            <button
                                type="button"
                                onClick={handleFailRun}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    backgroundColor: '#ff9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                }}
                            >
                                Mark Failed
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Progress indicator */}
            {hasActiveRun && (
                <div
                    style={{
                        width: '100%',
                        maxWidth: '600px',
                        padding: '0 16px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px',
                            color: 'white',
                            fontSize: '14px',
                        }}
                    >
                        <span>
                            {runState?.failed ? (
                                <span style={{ color: '#f44336' }}>Failed</span>
                            ) : (
                                `Progress: ${progress}%`
                            )}
                        </span>
                        <span>
                            {runState?.completed.length || 0} /{' '}
                            {(runState?.completed.length || 0) +
                                (runState?.queue.length || 0)}
                        </span>
                    </div>
                    <div
                        style={{
                            width: '100%',
                            height: '20px',
                            backgroundColor: '#333',
                            borderRadius: '10px',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                width: `${progress}%`,
                                height: '100%',
                                backgroundColor: runState?.failed ? '#f44336' : '#4CAF50',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Character grid */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '8px',
                    alignSelf: 'center',
                }}
            >
                {hasActiveRun && rows.length > 0 ? (
                    rows.map((row, rowIndex) => {
                        const indent = rowIndex * 45;

                        return (
                            <div
                                key={`row-${rowIndex}`}
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginLeft: indent,
                                }}
                            >
                                {row.map((char) => (
                                    <div
                                        key={char.name}
                                        style={{
                                            position: 'relative',
                                            cursor: char.isCompleted || char.isFailed ? 'default' : 'pointer',
                                            opacity: char.isCompleted || char.isFailed ? 0.5 : 1,
                                        }}
                                        onClick={() => {
                                            if (!char.isCompleted && !char.isFailed) {
                                                handleCompleteCharacter(char.name);
                                            }
                                        }}
                                    >
                                        <img
                                            src={char.portrait}
                                            alt={char.name}
                                            style={{
                                                width: '96px',
                                                height: '96px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: char.isFailed
                                                    ? '2px solid #f44336'
                                                    : char.isCompleted
                                                        ? '2px solid #4CAF50'
                                                        : '2px solid #444444',
                                                filter:
                                                    char.isCompleted || char.isFailed
                                                        ? 'grayscale(100%)'
                                                        : 'none',
                                            }}
                                        />
                                        {(char.isCompleted || char.isFailed) && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    fontSize: '48px',
                                                    color: char.isFailed ? '#f44336' : '#4CAF50',
                                                    fontWeight: 'bold',
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                                }}
                                            >
                                                {char.isFailed ? '✕' : '✓'}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })
                ) : (
                    <div
                        style={{
                            color: '#888',
                            textAlign: 'center',
                            padding: '40px',
                        }}
                    >
                        {hasActiveRun
                            ? 'No characters in run'
                            : 'Click "Start New Run" to begin an Iron Man challenge'}
                    </div>
                )}
            </div>

            {/* Queue indicator */}
            {hasActiveRun && runState && runState.queue.length > 0 && (
                <div
                    style={{
                        marginTop: '16px',
                        padding: '8px 16px',
                        backgroundColor: '#333',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                    }}
                >
                    <strong>Next:</strong> {runState.queue[0]}
                </div>
            )}
        </div>
    );
};

export default IronManRun;

