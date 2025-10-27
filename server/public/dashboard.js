// Dashboard WebSocket client
const socket = io();

// Local video player
const video = document.getElementById('f1-video');
if (video) {
  video.loop = true;
  video.muted = true;

  // Try to play video when loaded
  video.addEventListener('canplay', () => {
    console.log('Video ready to play');
    video.play().catch(err => {
      console.log('Video autoplay blocked:', err.message);
      // Try again on user interaction
      document.addEventListener('click', () => {
        video.play().catch(e => console.log('Video play error:', e));
      }, { once: true });
    });
  });

  video.addEventListener('error', (e) => {
    console.error('Video loading error:', video.error);
  });
}

// Background music player
const music = document.getElementById('background-music');
const musicOverlay = document.getElementById('music-overlay');
let musicStarted = false;

if (music) {
  music.volume = 0.3; // Set volume to 30%

  console.log('Music element found, src:', music.src);

  // Function to start music
  const startMusic = () => {
    if (musicStarted) return;

    music.play()
      .then(() => {
        console.log('✓ Music playing successfully');
        musicStarted = true;
        if (musicOverlay) {
          musicOverlay.style.display = 'none';
        }
      })
      .catch(err => {
        console.error('✗ Music play failed:', err.message);
        // Show overlay to prompt user interaction
        if (musicOverlay && !musicStarted) {
          musicOverlay.style.display = 'block';
        }
      });
  };

  // Try to play when ready
  music.addEventListener('canplaythrough', () => {
    console.log('Music can play through');
    startMusic();
  });

  // Show overlay and setup click handler
  setTimeout(() => {
    if (!musicStarted && musicOverlay) {
      musicOverlay.style.display = 'block';
    }
  }, 2000); // Show after 2 seconds if music hasn't started

  // Click on overlay to start music
  if (musicOverlay) {
    musicOverlay.addEventListener('click', () => {
      startMusic();
    });
  }

  // Click anywhere to start
  document.addEventListener('click', () => {
    if (!musicStarted) {
      console.log('Starting music on user interaction');
      startMusic();
    }
  }, { once: true });

  music.addEventListener('error', (e) => {
    console.error('✗ Music loading error:', music.error ? music.error.code : 'unknown', music.error);
  });

  // Load the audio
  music.load();
}

let raceStartTime = null;
let raceDurationInterval = null;

// Format time in milliseconds to MM:SS.mmm
function formatLapTime(ms) {
  if (!ms || ms === 0) return '-';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000));
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// Format race duration
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update timestamp
function updateTimestamp() {
  document.getElementById('timestamp').textContent = new Date().toLocaleTimeString();
}

// Register dashboard with server
socket.on('connect', () => {
  console.log('Connected to server');
  document.getElementById('wsStatus').textContent = 'Connected';
  document.getElementById('wsIndicator').classList.remove('error');
  document.getElementById('wsIndicator').classList.add('connected');

  socket.emit('dashboard:register');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  document.getElementById('wsStatus').textContent = 'Disconnected';
  document.getElementById('wsIndicator').classList.remove('connected');
  document.getElementById('wsIndicator').classList.add('error');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  document.getElementById('wsStatus').textContent = 'Connection Error';
  document.getElementById('wsIndicator').classList.remove('connected');
  document.getElementById('wsIndicator').classList.add('error');
});

// State change handler
socket.on('state:change', (data) => {
  const stateElement = document.getElementById('systemState');
  if (stateElement) {
    stateElement.textContent = data.state;
    stateElement.className = 'system-state ' + data.state.toLowerCase();
  }

  if (data.state === 'RACING') {
    raceStartTime = Date.now();
    startRaceDurationTimer();
  } else {
    stopRaceDurationTimer();
  }
});

// Rig status update
socket.on('rig:status', (status) => {
  updateRigStatus('rig-1', status['rig-1']);
  updateRigStatus('rig-2', status['rig-2']);
});

function updateRigStatus(rigId, data) {
  const statusElement = document.getElementById(rigId === 'rig-1' ? 'rig1Status' : 'rig2Status');
  const nameElement = document.getElementById(rigId === 'rig-1' ? 'rig1Name' : 'rig2Name');

  if (!statusElement || !nameElement) return;

  // Get status text element
  const statusTextElement = statusElement.querySelector('.status-text');

  if (data.connected && data.playerName) {
    // Player is registered and ready
    statusElement.classList.add('connected');
    if (statusTextElement) {
      statusTextElement.textContent = 'Ready to Race';
    }
    nameElement.textContent = data.playerName;
  } else if (data.connected) {
    // Connected but no player
    statusElement.classList.add('connected');
    if (statusTextElement) {
      statusTextElement.textContent = 'Connected';
    }
    nameElement.textContent = '—';
  } else {
    // Not connected
    statusElement.classList.remove('connected');
    if (statusTextElement) {
      statusTextElement.textContent = 'Waiting';
    }
    nameElement.textContent = '—';
  }
}

// Race data update
socket.on('race:data', (race) => {
  if (race.sessionId) {
    document.getElementById('sessionId').textContent = race.sessionId.substring(0, 8);
  }

  updateLeaderboard(race);
});

// Telemetry update
socket.on('telemetry:update', (data) => {
  if (!data.liveTelemetry) return;

  data.liveTelemetry.forEach(telemetry => {
    updateTelemetryDisplay(telemetry);
  });

  updateTimestamp();
});

// Race completed
socket.on('race:completed', (race) => {
  updateLeaderboard(race);

  // Calculate fastest lap
  let fastestLap = Infinity;
  race.players.forEach(player => {
    if (player.fastestLap && player.fastestLap < fastestLap) {
      fastestLap = player.fastestLap;
    }
  });

  if (fastestLap !== Infinity) {
    document.getElementById('fastestLap').textContent = formatLapTime(fastestLap);
  }

  stopRaceDurationTimer();
});

function updateLeaderboard(race) {
  const leaderboardList = document.getElementById('leaderboardList');

  if (!race.players || race.players.length === 0) {
    leaderboardList.innerHTML = '<div class="no-data">No players registered</div>';
    return;
  }

  // Sort by position
  const sortedPlayers = [...race.players].sort((a, b) => {
    if (a.finalPosition && b.finalPosition) {
      return a.finalPosition - b.finalPosition;
    }
    return 0;
  });

  leaderboardList.innerHTML = sortedPlayers.map((player, index) => {
    const position = player.finalPosition || (index + 1);
    const isFirst = position === 1;

    return `
      <div class="leaderboard-item ${isFirst ? 'first' : ''}">
        <div class="position">${position}</div>
        <div class="driver-info">
          <div class="driver-name">${player.name}</div>
          <div class="driver-stats">
            <span>Fastest: ${formatLapTime(player.fastestLap)}</span>
            <span>Laps: ${player.lapTimes.length}</span>
            ${player.totalTime ? `<span>Total: ${formatLapTime(player.totalTime)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateTelemetryDisplay(telemetry) {
  const prefix = telemetry.rigId === 'rig-1' ? 'rig1' : 'rig2';

  document.getElementById(`${prefix}Position`).textContent = telemetry.position || '-';
  document.getElementById(`${prefix}Lap`).textContent = telemetry.currentLap || '-';
  document.getElementById(`${prefix}LastLap`).textContent = formatLapTime(telemetry.lastLapTime);
  document.getElementById(`${prefix}Speed`).textContent = telemetry.speed ? `${telemetry.speed} km/h` : '- km/h';

  if (telemetry.gap && telemetry.gap > 0) {
    document.getElementById(`${prefix}Gap`).textContent = `+${(telemetry.gap / 1000).toFixed(3)}s`;
  } else if (telemetry.position === 1) {
    document.getElementById(`${prefix}Gap`).textContent = 'Leader';
  } else {
    document.getElementById(`${prefix}Gap`).textContent = '-';
  }
}

function startRaceDurationTimer() {
  stopRaceDurationTimer();

  raceDurationInterval = setInterval(() => {
    if (raceStartTime) {
      const duration = Date.now() - raceStartTime;
      document.getElementById('raceDuration').textContent = formatDuration(duration);
    }
  }, 1000);
}

function stopRaceDurationTimer() {
  if (raceDurationInterval) {
    clearInterval(raceDurationInterval);
    raceDurationInterval = null;
  }
}

// Initial timestamp update
updateTimestamp();
setInterval(updateTimestamp, 1000);
