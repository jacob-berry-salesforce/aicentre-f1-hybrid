// Sim Attract Screen JavaScript
const socket = io();

// Get rig number from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const rigNumber = urlParams.get('rig') || '1';
const rigId = `rig-${rigNumber}`;
const previewMode = urlParams.get('preview') === 'true';

// Enable preview mode for development on smaller screens
if (previewMode) {
  document.body.classList.add('preview-mode');
  console.log('Preview mode enabled - screen scaled for development');
}

// Update sim identifier
document.getElementById('simTitle').textContent = `Simulator ${rigNumber}`;
document.getElementById('simLocation').textContent = rigNumber === '1' ? 'LEFT' : 'RIGHT';

// Video players - offset one to avoid sync
const videoLeft = document.getElementById('f1-video-left');
const videoRight = document.getElementById('f1-video-right');

console.log('Video elements:', {
  left: !!videoLeft,
  right: !!videoRight,
  leftSrc: videoLeft?.currentSrc || 'no src',
  rightSrc: videoRight?.currentSrc || 'no src',
  leftReadyState: videoLeft?.readyState,
  rightReadyState: videoRight?.readyState
});

let leftVideoPlaying = false;
let rightVideoPlaying = false;

if (videoLeft) {
  videoLeft.loop = false; // Disable native loop, we'll handle it manually
  videoLeft.muted = true;

  console.log('Left video initialized', {
    src: videoLeft.currentSrc,
    readyState: videoLeft.readyState,
    networkState: videoLeft.networkState
  });

  const MAX_VIDEO_TIME = 102; // 1:42 in seconds

  // Handle custom loop point at 1:42
  videoLeft.addEventListener('timeupdate', () => {
    if (videoLeft.currentTime >= MAX_VIDEO_TIME) {
      console.log(`Left video reached ${MAX_VIDEO_TIME}s, looping back to start`);
      videoLeft.currentTime = 0;
      videoLeft.play();
    }
  });

  const playLeftVideo = () => {
    if (leftVideoPlaying) return;

    console.log(`Attempting to play left video from ${videoLeft.currentTime.toFixed(2)}s`);

    videoLeft.play()
      .then(() => {
        console.log(`✓ Left video playing from ${videoLeft.currentTime.toFixed(2)}s (will loop at ${MAX_VIDEO_TIME}s)`);
        leftVideoPlaying = true;
      })
      .catch(err => {
        console.log('Left video autoplay blocked:', err.message);
        document.addEventListener('click', playLeftVideo, { once: true });
      });
  };

  videoLeft.addEventListener('loadedmetadata', () => {
    console.log(`Left video metadata loaded. Duration: ${videoLeft.duration.toFixed(2)}s (will loop at ${MAX_VIDEO_TIME}s)`);
  });

  videoLeft.addEventListener('loadeddata', () => {
    console.log('Left video data loaded (first frame)');
  });

  videoLeft.addEventListener('canplay', () => {
    console.log('Left video can play');
    playLeftVideo();
  });

  videoLeft.addEventListener('error', (e) => {
    console.error('Left video loading error:', videoLeft.error);
  });

  // If already loaded, trigger play
  if (videoLeft.readyState >= 3) {
    console.log('Left video already ready, playing immediately');
    playLeftVideo();
  }
}

if (videoRight) {
  videoRight.loop = false; // Disable native loop, we'll handle it manually
  videoRight.muted = true;

  console.log('Right video initialized', {
    src: videoRight.currentSrc,
    readyState: videoRight.readyState,
    networkState: videoRight.networkState
  });

  let offsetApplied = false;
  const MAX_VIDEO_TIME = 102; // 1:42 in seconds

  // Handle custom loop point at 1:42
  videoRight.addEventListener('timeupdate', () => {
    if (videoRight.currentTime >= MAX_VIDEO_TIME) {
      console.log(`Right video reached ${MAX_VIDEO_TIME}s, looping back to offset`);
      // Loop back to the offset position (51 seconds for 50% offset)
      const offsetTime = MAX_VIDEO_TIME / 2;
      videoRight.currentTime = offsetTime;
      videoRight.play();
    }
  });

  videoRight.addEventListener('loadedmetadata', () => {
    // Set the offset time immediately when metadata is loaded
    const duration = videoRight.duration;
    console.log(`Right video metadata loaded. Duration: ${duration.toFixed(2)}s (will loop at ${MAX_VIDEO_TIME}s)`);

    if (duration && !isNaN(duration) && duration > 0 && !offsetApplied) {
      const offsetTime = MAX_VIDEO_TIME / 2; // Start at 51 seconds
      videoRight.currentTime = offsetTime;
      offsetApplied = true;
      console.log(`✓ Right video offset set to ${offsetTime.toFixed(2)}s (50% of ${MAX_VIDEO_TIME}s)`);
      console.log(`Current right video time: ${videoRight.currentTime.toFixed(2)}s`);
    }
  });

  videoRight.addEventListener('loadeddata', () => {
    console.log('Right video data loaded (first frame)');
  });

  const playRightVideo = () => {
    if (rightVideoPlaying) return;

    console.log(`Right video current time before play: ${videoRight.currentTime.toFixed(2)}s`);

    // Ensure offset is applied before playing
    if (!offsetApplied && videoRight.duration && !isNaN(videoRight.duration)) {
      const offsetTime = MAX_VIDEO_TIME / 2;
      videoRight.currentTime = offsetTime;
      offsetApplied = true;
      console.log(`✓ Right video offset applied (late): ${offsetTime.toFixed(2)}s`);
    }

    console.log(`Attempting to play right video from ${videoRight.currentTime.toFixed(2)}s`);

    videoRight.play()
      .then(() => {
        console.log(`✓ Right video playing from ${videoRight.currentTime.toFixed(2)}s (will loop at ${MAX_VIDEO_TIME}s)`);
        rightVideoPlaying = true;
      })
      .catch(err => {
        console.log('Right video autoplay blocked:', err.message);
        document.addEventListener('click', playRightVideo, { once: true });
      });
  };

  videoRight.addEventListener('canplay', () => {
    console.log('Right video can play');
    // Small delay to ensure offset is set
    setTimeout(playRightVideo, 100);
  });

  videoRight.addEventListener('error', (e) => {
    console.error('Right video loading error:', videoRight.error);
  });

  // If already loaded, trigger play
  if (videoRight.readyState >= 3) {
    console.log('Right video already ready, applying offset and playing');
    if (videoRight.duration && !offsetApplied) {
      const offsetTime = MAX_VIDEO_TIME / 2;
      videoRight.currentTime = offsetTime;
      offsetApplied = true;
      console.log(`✓ Right video offset set (immediate): ${offsetTime.toFixed(2)}s`);
    }
    setTimeout(playRightVideo, 100);
  }

  // Verify offset periodically (debug)
  setInterval(() => {
    if (leftVideoPlaying && rightVideoPlaying && videoLeft && videoRight) {
      const leftTime = videoLeft.currentTime;
      const rightTime = videoRight.currentTime;
      const timeDiff = Math.abs(leftTime - rightTime);
      console.log(`Video sync check - Left: ${leftTime.toFixed(2)}s, Right: ${rightTime.toFixed(2)}s, Diff: ${timeDiff.toFixed(2)}s`);

      if (timeDiff < 5) { // If videos are too close (less than 5 seconds apart)
        console.warn(`⚠️ Videos may be synchronized! Diff: ${timeDiff.toFixed(2)}s`);
      }
    }
  }, 10000); // Check every 10 seconds
}

// Background music player
const music = document.getElementById('background-music');
const musicOverlay = document.getElementById('music-overlay');
let musicStarted = false;

if (music) {
  music.volume = 0.3;

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
        if (musicOverlay && !musicStarted) {
          musicOverlay.style.display = 'block';
        }
      });
  };

  music.addEventListener('canplaythrough', () => {
    console.log('Music can play through');
    startMusic();
  });

  setTimeout(() => {
    if (!musicStarted && musicOverlay) {
      musicOverlay.style.display = 'block';
    }
  }, 2000);

  if (musicOverlay) {
    musicOverlay.addEventListener('click', () => {
      startMusic();
    });
  }

  document.addEventListener('click', () => {
    if (!musicStarted) {
      startMusic();
    }
  }, { once: true });

  music.addEventListener('error', (e) => {
    console.error('✗ Music loading error:', music.error);
  });

  music.load();
}

// Generate QR Code - Uses Heroku app URL from server config
// Fetch Heroku URL from server
fetch('/api/config')
  .then(response => response.json())
  .then(config => {
    const herokuUrl = config.herokuAppUrl || window.location.origin;
    const qrUrl = `${herokuUrl}/register?rig=${rigNumber}`;

    console.log('Generating QR code for:', qrUrl);

    // Generate real QR code using qrcode.js library
    const qrCanvas = document.createElement('canvas');
    QRCode.toCanvas(qrCanvas, qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#00529F',
        light: '#FFFFFF'
      }
    }, (error) => {
      if (error) {
        console.error('QR Code generation error:', error);
        // Keep fake QR code on error
      } else {
        console.log('QR Code generated successfully');
        const qrPlaceholder = document.getElementById('qrCode');
        qrPlaceholder.innerHTML = '';
        qrPlaceholder.appendChild(qrCanvas);
      }
    });
  })
  .catch(error => {
    console.error('Failed to fetch Heroku URL from server:', error);
    console.log('Using fake QR code placeholder');
  });

// WebSocket connection
socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('rig:register', { rigId: rigId });
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Player registration handler
socket.on('player:registered', (data) => {
  console.log('Player registered:', data);

  if (data.rigId === rigId) {
    // Show player status, hide QR code
    const qrCard = document.querySelector('.qr-card-center');
    if (qrCard) qrCard.style.display = 'none';

    const playerStatus = document.getElementById('playerStatus');
    const playerName = document.getElementById('playerName');

    if (playerStatus && playerName) {
      playerName.textContent = data.name;
      playerStatus.style.display = 'flex';
    }
  }
});

// Reset to attract screen
socket.on('command:reset', () => {
  console.log('Reset to attract screen');

  // Show QR code again
  const qrCard = document.querySelector('.qr-card-center');
  if (qrCard) qrCard.style.display = 'block';

  const playerStatus = document.getElementById('playerStatus');
  if (playerStatus) {
    playerStatus.style.display = 'none';
  }
});

// Race start handler (this screen will be hidden by rig client)
socket.on('command:start_race', () => {
  console.log('Race starting - rig client should switch to game');
});

// Race end handler
socket.on('command:end_race', () => {
  console.log('Race ended - showing results');
  // Could redirect to results screen or stay as-is
});

// Fetch and display track information
async function loadTrackInfo() {
  try {
    console.log('Fetching track information from OpenF1 API...');
    const response = await fetch('/api/track-info');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const trackInfo = await response.json();
    console.log('Track info received:', trackInfo);

    // Update track header
    document.getElementById('trackFlag').textContent = trackInfo.flag;
    document.getElementById('trackName').textContent = trackInfo.name;
    document.getElementById('trackCircuit').textContent = trackInfo.circuit;

    // Load track map
    loadTrackMap(trackInfo.name);

    // Update track facts
    const factsList = document.getElementById('factsList');
    const factIcons = ['🏁', '📏', '⏱️', '🏆', '🌍'];

    if (trackInfo.facts && trackInfo.facts.length > 0) {
      factsList.innerHTML = trackInfo.facts.map((fact, index) => `
        <div class="fact-item">
          <span class="fact-icon">${factIcons[index % factIcons.length]}</span>
          <span class="fact-text">${fact}</span>
        </div>
      `).join('');
    }

    // Update lap records if available
    const lapRecordsSection = document.getElementById('lapRecordsSection');
    const recordsList = document.getElementById('recordsList');
    const sessionType = document.getElementById('sessionType');

    if (trackInfo.lapRecords && trackInfo.lapRecords.length > 0) {
      console.log('Displaying lap records:', trackInfo.lapRecords);

      // Show the lap records section
      lapRecordsSection.style.display = 'flex';

      // Update session type
      sessionType.textContent = trackInfo.sessionType || 'Session';

      // Render lap records
      recordsList.innerHTML = trackInfo.lapRecords.map((record) => `
        <div class="record-item">
          <span class="record-position">${record.position}</span>
          <div class="record-driver">
            <span class="driver-acronym">${record.driverAcronym}</span>
            <span class="driver-team" style="color: #${record.teamColor}">${record.teamName}</span>
          </div>
          <span class="record-time">${record.lapTime}</span>
        </div>
      `).join('');
    } else {
      // Hide lap records section if no data
      lapRecordsSection.style.display = 'none';
      console.log('No lap records available');
    }

  } catch (error) {
    console.error('Error loading track info:', error);
    // Keep default Mexico City info on error
  }
}

// ==================== TRACK MAPS DATA ====================

const trackMaps = {
  'Mexico City': `
    <path d="M 30,50 L 50,30 L 75,35 L 85,50 L 85,70 L 75,85 L 45,90 L 25,75 L 20,60 Z"
      stroke="#E10600" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="30" cy="50" r="8" fill="#FFD700"/>
    <text x="30" y="55" text-anchor="middle" fill="white" font-size="8" font-weight="bold">S/F</text>
  `,
  'Bahrain': `
    <path d="M 50,20 Q 80,20 90,40 L 90,60 Q 90,80 70,90 L 40,90 Q 20,90 15,70 L 15,40 Q 15,20 50,20"
      stroke="#E10600" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="20" r="8" fill="#FFD700"/>
    <text x="50" y="25" text-anchor="middle" fill="white" font-size="10" font-weight="bold">START</text>
  `,
  'Monaco': `
    <path d="M 60,30 L 80,50 L 85,80 L 70,95 L 40,95 L 25,80 Q 20,70 20,60 L 20,40 Q 30,30 60,30"
      stroke="#E10600" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="60" cy="30" r="7" fill="#FFD700"/>
  `,
  'Silverstone': `
    <path d="M 40,30 L 80,30 Q 90,30 90,40 L 90,70 Q 90,80 80,85 L 30,85 Q 20,80 20,70 L 20,50 Q 20,30 40,30"
      stroke="#E10600" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="40" cy="30" r="8" fill="#FFD700"/>
  `,
  'Monza': `
    <path d="M 30,40 L 70,40 L 80,50 L 80,70 L 70,85 L 30,85 L 20,70 L 20,50 Z"
      stroke="#E10600" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="30" cy="40" r="8" fill="#FFD700"/>
  `,
  'Spa-Francorchamps': `
    <path d="M 50,25 L 85,40 L 90,60 L 75,85 L 40,90 L 20,70 L 25,40 Z"
      stroke="#E10600" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="25" r="8" fill="#FFD700"/>
  `,
  'Suzuka': `
    <path d="M 30,50 Q 30,30 50,30 L 80,30 Q 90,40 85,60 Q 80,80 60,85 L 35,85 Q 20,75 20,60 L 20,50"
      stroke="#E10600" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="30" cy="50" r="8" fill="#FFD700"/>
  `
};

const trackStats = {
  'Bahrain': { length: '5.412 km', corners: '15', drs: '3' },
  'Monaco': { length: '3.337 km', corners: '19', drs: '1' },
  'Silverstone': { length: '5.891 km', corners: '18', drs: '2' },
  'Monza': { length: '5.793 km', corners: '11', drs: '2' },
  'Spa-Francorchamps': { length: '7.004 km', corners: '19', drs: '2' },
  'Suzuka': { length: '5.807 km', corners: '18', drs: '2' },
  'Mexico City': { length: '4.304 km', corners: '17', drs: '3' },
  'São Paulo': { length: '4.309 km', corners: '15', drs: '2' },
  'Las Vegas': { length: '6.120 km', corners: '17', drs: '2' },
  'Abu Dhabi': { length: '5.281 km', corners: '16', drs: '2' }
};

// Load track map
function loadTrackMap(trackName) {
  const trackMapSvg = document.getElementById('trackMap');
  const mapPath = trackMaps[trackName] || trackMaps['Mexico City'];

  if (mapPath) {
    trackMapSvg.setAttribute('viewBox', '0 0 110 110');
    trackMapSvg.innerHTML = `
      <rect width="110" height="110" fill="#f8f9fa"/>
      ${mapPath}
    `;
  }

  // Update track stats
  const stats = trackStats[trackName] || trackStats['Mexico City'];
  if (stats) {
    document.getElementById('trackLength').textContent = stats.length;
    document.getElementById('trackCorners').textContent = stats.corners;
    document.getElementById('trackDRS').textContent = stats.drs;
  }
}

// ==================== SESSION SCHEDULE ====================

function loadSessionSchedule() {
  // Example data - in production this would come from OpenF1 API
  const sessions = [
    { icon: '🏁', name: 'FP1', time: 'Fri 14:30', status: 'completed' },
    { icon: '🏁', name: 'FP2', time: 'Fri 18:00', status: 'completed' },
    { icon: '🏁', name: 'FP3', time: 'Sat 13:30', status: 'completed' },
    { icon: '⚡', name: 'Qualifying', time: 'Sat 17:00', status: 'active' },
    { icon: '🏆', name: 'Race', time: 'Sun 16:00', status: 'upcoming' }
  ];

  const scheduleList = document.getElementById('scheduleList');
  scheduleList.innerHTML = sessions.map(session => `
    <div class="schedule-item ${session.status}">
      <span class="session-icon">${session.icon}</span>
      <span class="session-name">${session.name}</span>
      <span class="session-time">${session.time}</span>
    </div>
  `).join('');
}

// ==================== TRACK CONDITIONS ====================

function loadTrackConditions() {
  // Mock data - would come from weather API or OpenF1
  const conditions = {
    airTemp: Math.floor(Math.random() * 10) + 20,
    trackTemp: Math.floor(Math.random() * 15) + 30,
    windSpeed: Math.floor(Math.random() * 15) + 5,
    humidity: Math.floor(Math.random() * 20) + 40
  };

  document.getElementById('airTemp').textContent = `${conditions.airTemp}°C`;
  document.getElementById('trackTemp').textContent = `${conditions.trackTemp}°C`;
  document.getElementById('windSpeed').textContent = `${conditions.windSpeed} km/h`;
  document.getElementById('humidity').textContent = `${conditions.humidity}%`;
}

// ==================== DRIVER STANDINGS ====================

function loadDriverStandings() {
  // Mock championship standings - would come from API
  const standings = [
    { position: 1, driver: 'M. Verstappen', points: 393 },
    { position: 2, driver: 'L. Norris', points: 331 },
    { position: 3, driver: 'C. Leclerc', points: 307 },
    { position: 4, driver: 'O. Piastri', points: 262 },
    { position: 5, driver: 'C. Sainz', points: 244 }
  ];

  const standingsDiv = document.getElementById('driverStandings');
  standingsDiv.innerHTML = standings.map(s => `
    <div class="standing-item">
      <span class="standing-position">${s.position}</span>
      <span class="standing-driver">${s.driver}</span>
      <span class="standing-points">${s.points} pts</span>
    </div>
  `).join('');
}

// Load track info on page load
loadTrackInfo();
loadSessionSchedule();
loadTrackConditions();
loadDriverStandings();

// Refresh track info every 15 minutes (matches server cache duration)
setInterval(loadTrackInfo, 15 * 60 * 1000);
setInterval(loadTrackConditions, 30 * 1000); // Update conditions every 30 seconds

console.log(`Sim attract screen loaded for Rig ${rigNumber}`);
console.log(`QR Code URL: ${qrUrl}`);
