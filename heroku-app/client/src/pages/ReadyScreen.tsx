import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import './ReadyScreen.css';

let socket: Socket | null = null;

function ReadyScreen() {
  const [searchParams] = useSearchParams();
  const rig = searchParams.get('rig') || '1';
  const name = searchParams.get('name') || 'Racer';

  useEffect(() => {
    // Connect to socket for race start notifications
    if (!socket) {
      socket = io();

      socket.on('connect', () => {
        console.log('Connected to server');
      });

      socket.on('state:change', (data) => {
        console.log('State change:', data);
        // Could show different messages based on state
      });

      socket.on('command:start_race', () => {
        console.log('Race starting!');
        // The rig client will handle switching to the game
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return (
    <div className="ready-screen fullscreen">
      <div className="ready-content animate-slide-in">
        <div className="checkmark-container">
          <div className="checkmark">✓</div>
        </div>

        <h1>READY TO RACE!</h1>

        <div className="player-info">
          <p className="player-name">{name}</p>
          <p className="rig-info">RIG {rig}</p>
        </div>

        <div className="waiting-message">
          <p className="animate-pulse">Waiting for race to start...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="ready-instructions">
          <p>Get ready! The race will start soon.</p>
          <p>Good luck!</p>
        </div>
      </div>
    </div>
  );
}

export default ReadyScreen;
