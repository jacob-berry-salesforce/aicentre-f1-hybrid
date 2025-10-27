import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from './logger';

export enum BrowserState {
  ATTRACT = 'ATTRACT',
  READY = 'READY',
  RESULTS = 'RESULTS'
}

export class BrowserController {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private herokuAppUrl: string;
  private rigId: string;
  private currentState: BrowserState | null = null;

  constructor(herokuAppUrl: string, rigId: string) {
    this.herokuAppUrl = herokuAppUrl;
    this.rigId = rigId;
  }

  /**
   * Launch browser in kiosk mode
   */
  async launch(): Promise<void> {
    try {
      logger.info('Launching browser in kiosk mode...');

      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          '--kiosk',
          '--start-fullscreen',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-infobars',
          '--disable-session-crashed-bubble',
          '--disable-restore-session-state'
        ],
        defaultViewport: null
      });

      const pages = await this.browser.pages();
      this.page = pages[0] || await this.browser.newPage();

      logger.info('Browser launched successfully');
    } catch (error) {
      logger.error('Error launching browser:', error);
      throw error;
    }
  }

  /**
   * Navigate to attract screen
   */
  async showAttractScreen(): Promise<void> {
    if (!this.page) {
      logger.warn('Browser not launched, launching now...');
      await this.launch();
    }

    try {
      const rigNumber = this.rigId.split('-')[1];
      const url = `${this.herokuAppUrl}/attract?rig=${rigNumber}`;

      logger.info(`Navigating to attract screen: ${url}`);
      await this.page!.goto(url, { waitUntil: 'networkidle2' });

      this.currentState = BrowserState.ATTRACT;
    } catch (error) {
      logger.error('Error showing attract screen:', error);
    }
  }

  /**
   * Navigate to ready screen
   */
  async showReadyScreen(playerName: string): Promise<void> {
    if (!this.page) {
      logger.warn('Browser not launched, launching now...');
      await this.launch();
    }

    try {
      const rigNumber = this.rigId.split('-')[1];
      const url = `${this.herokuAppUrl}/ready?rig=${rigNumber}&name=${encodeURIComponent(playerName)}`;

      logger.info(`Navigating to ready screen: ${url}`);
      await this.page!.goto(url, { waitUntil: 'networkidle2' });

      this.currentState = BrowserState.READY;
    } catch (error) {
      logger.error('Error showing ready screen:', error);
    }
  }

  /**
   * Navigate to results screen
   */
  async showResultsScreen(): Promise<void> {
    if (!this.page) {
      logger.warn('Browser not launched, launching now...');
      await this.launch();
    }

    try {
      const url = `${this.herokuAppUrl}/results`;

      logger.info(`Navigating to results screen: ${url}`);
      await this.page!.goto(url, { waitUntil: 'networkidle2' });

      this.currentState = BrowserState.RESULTS;
    } catch (error) {
      logger.error('Error showing results screen:', error);
    }
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        this.currentState = null;
        logger.info('Browser closed');
      }
    } catch (error) {
      logger.error('Error closing browser:', error);
    }
  }

  /**
   * Check if browser is running
   */
  isRunning(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }

  /**
   * Get current state
   */
  getCurrentState(): BrowserState | null {
    return this.currentState;
  }

  /**
   * Reload current page
   */
  async reload(): Promise<void> {
    try {
      if (this.page) {
        await this.page.reload({ waitUntil: 'networkidle2' });
        logger.info('Browser page reloaded');
      }
    } catch (error) {
      logger.error('Error reloading page:', error);
    }
  }
}
