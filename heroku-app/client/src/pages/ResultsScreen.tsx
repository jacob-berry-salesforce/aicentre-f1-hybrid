import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './ResultsScreen.css';

let socket: Socket | null = null;

interface PlayerResult {
  rigId: string;
  name: string;
  finalPosition?: number;
  fastestLap?: number;
  totalTime?: number;
  lapTimes: number[];
}

interface RaceData {
  sessionId: string;
  timestamp: Date;
  players: PlayerResult[];
  winner?: string;
  raceCompleted: boolean;
}

function formatLapTime(ms?: number): string {
  if (!ms || ms === 0) return '-';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor(ms % 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function ResultsScreen() {
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();

    // Connect to socket for live updates
    if (!socket) {
      socket = io();

      socket.on('connect', () => {
        console.log('Connected to server');
        socket!.emit('request:race_results');
      });

      socket.on('race:results', (data: RaceData) => {
        setRaceData(data);
        setLoading(false);
      });

      socket.on('race:completed', (data: RaceData) => {
        setRaceData(data);
        setLoading(false);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/race-results');
      if (response.ok) {
        const data = await response.json();
        setRaceData(data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="results-screen fullscreen">
        <div className="loading-container">
          <h2>Loading Results...</h2>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  if (!raceData || raceData.players.length === 0) {
    return (
      <div className="results-screen fullscreen">
        <div className="no-results">
          <h2>No Race Data Available</h2>
          <p>Complete a race to see results here.</p>
        </div>
      </div>
    );
  }

  const sortedPlayers = [...raceData.players].sort((a, b) => {
    if (a.finalPosition && b.finalPosition) {
      return a.finalPosition - b.finalPosition;
    }
    return 0;
  });

  return (
    <div className="results-screen fullscreen">
      <div className="results-content animate-slide-in">
        <h1>RACE RESULTS</h1>

        {raceData.winner && (
          <div className="winner-banner">
            <div className="trophy">🏆</div>
            <h2 className="winner-name">{raceData.winner}</h2>
            <p className="winner-text">WINNER!</p>
          </div>
        )}

        <div className="results-list">
          {sortedPlayers.map((player, index) => {
            const position = player.finalPosition || (index + 1);
            const isWinner = position === 1;

            return (
              <div
                key={player.rigId}
                className={`result-item ${isWinner ? 'winner' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="result-position">{position}</div>
                <div className="result-info">
                  <h3 className="result-name">{player.name}</h3>
                  <div className="result-stats">
                    <span>
                      <strong>Fastest Lap:</strong> {formatLapTime(player.fastestLap)}
                    </span>
                    <span>
                      <strong>Laps:</strong> {player.lapTimes.length}
                    </span>
                    {player.totalTime && (
                      <span>
                        <strong>Total Time:</strong> {formatLapTime(player.totalTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="results-footer">
          <p>Thank you for racing!</p>
        </div>
      </div>
    </div>
  );
}

export default ResultsScreen;
