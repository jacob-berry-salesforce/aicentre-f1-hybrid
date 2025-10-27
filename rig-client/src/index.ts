import { io, Socket } from 'socket.io-client';
import { loadConfig, Config } from './config';
import { logger } from './logger';
import { WindowManager } from './window-manager';
import { BrowserController } from './browser-controller';

class RigClient {
  private config: Config;
  private socket: Socket | null = null;
  private windowManager: WindowManager;
  private browserController: BrowserController;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private playerName: string | null = null;

  constructor() {
    this.config = loadConfig();
    this.windowManager = new WindowManager(this.config.f1GameWindowTitle);
    this.browserController = new BrowserController(
      this.config.herokuAppUrl,
      this.config.rigId
    );

    logger.info('Rig Client initialized', {
      rigId: this.config.rigId,
      serverUrl: this.config.serverUrl
    });
  }

  /**
   * Start the rig client
   */
  async start(): Promise<void> {
    logger.info('Starting rig client...');

    // Launch browser in kiosk mode
    await this.browserController.launch();
    await this.browserController.showAttractScreen();

    // Connect to server
    this.connect();

    // Setup graceful shutdown
    this.setupShutdownHandlers();
  }

  /**
   * Connect to the server
   */
  private connect(): void {
    logger.info(`Connecting to server: ${this.config.serverUrl}`);

    this.socket = io(this.config.serverUrl, {
      reconnection: true,
      reconnectionDelay: this.config.reconnectInterval,
      reconnectionAttempts: Infinity
    });

    this.socket.on('connect', () => {
      logger.info('Connected to server');

      // Register this rig
      this.socket!.emit('rig:register', { rigId: this.config.rigId });

      // Start heartbeat
      this.startHeartbeat();

      // Clear reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    });

    this.socket.on('disconnect', (reason) => {
      logger.warn('Disconnected from server', { reason });
      this.stopHeartbeat();
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Connection error:', error);
    });

    // Command handlers
    this.socket.on('command:start_race', () => this.handleStartRace());
    this.socket.on('command:end_race', (data) => this.handleEndRace(data));
    this.socket.on('command:reset', () => this.handleReset());

    // State change handler
    this.socket.on('state:change', (data) => this.handleStateChange(data));

    // Player registration handler
    this.socket.on('player:registered', (data) => this.handlePlayerRegistered(data));
  }

  /**
   * Handle START_RACE command
   */
  private async handleStartRace(): Promise<void> {
    logger.info('START_RACE command received');

    try {
      // Close browser (or minimize it)
      // Note: In production, you might want to minimize instead of close
      // await this.browserController.close();

      // Focus F1 game window
      const success = await this.windowManager.focusF1Game();

      if (!success) {
        logger.warn('Failed to focus F1 game, it may not be running');
        // Optionally, you could launch the game here
      }

      logger.info('Switched to F1 game');
    } catch (error) {
      logger.error('Error handling start race:', error);
    }
  }

  /**
   * Handle END_RACE command
   */
  private async handleEndRace(data: any): Promise<void> {
    logger.info('END_RACE command received');

    try {
      // Show results screen in browser
      await this.browserController.showResultsScreen();

      // Focus browser window
      await this.windowManager.focusBrowser();

      logger.info('Switched to results screen');
    } catch (error) {
      logger.error('Error handling end race:', error);
    }
  }

  /**
   * Handle RESET command
   */
  private async handleReset(): Promise<void> {
    logger.info('RESET command received');

    try {
      // Clear player name
      this.playerName = null;

      // Show attract screen
      await this.browserController.showAttractScreen();

      // Focus browser window
      await this.windowManager.focusBrowser();

      logger.info('Reset to attract screen');
    } catch (error) {
      logger.error('Error handling reset:', error);
    }
  }

  /**
   * Handle state change
   */
  private async handleStateChange(data: any): Promise<void> {
    logger.info('State change received', data);

    const { state, playerName } = data;

    if (playerName) {
      this.playerName = playerName;
    }

    switch (state) {
      case 'ATTRACT':
        await this.browserController.showAttractScreen();
        await this.windowManager.focusBrowser();
        break;
      case 'RACING':
        await this.windowManager.focusF1Game();
        break;
      case 'RESULTS':
        await this.browserController.showResultsScreen();
        await this.windowManager.focusBrowser();
        break;
    }
  }

  /**
   * Handle player registration
   */
  private async handlePlayerRegistered(data: any): Promise<void> {
    const { rigId, name } = data;

    // Only process if this is for our rig
    if (rigId !== this.config.rigId) {
      return;
    }

    logger.info(`Player registered: ${name}`);
    this.playerName = name;

    // Show ready screen
    await this.browserController.showReadyScreen(name);
    await this.windowManager.focusBrowser();
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat', {
          rigId: this.config.rigId,
          timestamp: Date.now()
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupShutdownHandlers(): void {
    const shutdown = async () => {
      logger.info('Shutting down rig client...');

      this.stopHeartbeat();

      if (this.socket) {
        this.socket.disconnect();
      }

      await this.browserController.close();

      logger.info('Rig client shut down successfully');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }

  /**
   * Get connection status
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  /**
   * Get rig ID
   */
  public getRigId(): string {
    return this.config.rigId;
  }
}

// Start the client
const client = new RigClient();

client.start().catch((error) => {
  logger.error('Fatal error starting rig client:', error);
  process.exit(1);
});

// Export for testing
export default RigClient;
