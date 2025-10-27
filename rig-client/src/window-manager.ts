import { windowManager } from 'node-window-manager';
import { logger } from './logger';

export class WindowManager {
  private f1GameWindowTitle: string;

  constructor(f1GameWindowTitle: string) {
    this.f1GameWindowTitle = f1GameWindowTitle;
  }

  /**
   * Focus the F1 game window
   */
  async focusF1Game(): Promise<boolean> {
    try {
      const windows = windowManager.getWindows();
      const f1Window = windows.find(w =>
        w.getTitle().toLowerCase().includes(this.f1GameWindowTitle.toLowerCase())
      );

      if (f1Window) {
        f1Window.bringToTop();
        f1Window.restore();
        logger.info('F1 game window focused');
        return true;
      } else {
        logger.warn('F1 game window not found');
        return false;
      }
    } catch (error) {
      logger.error('Error focusing F1 game:', error);
      return false;
    }
  }

  /**
   * Focus Chrome browser window
   */
  async focusBrowser(): Promise<boolean> {
    try {
      const windows = windowManager.getWindows();
      const chromeWindow = windows.find(w =>
        w.getTitle().toLowerCase().includes('chrome') ||
        w.getTitle().toLowerCase().includes('browser')
      );

      if (chromeWindow) {
        chromeWindow.bringToTop();
        chromeWindow.restore();
        logger.info('Browser window focused');
        return true;
      } else {
        logger.warn('Browser window not found');
        return false;
      }
    } catch (error) {
      logger.error('Error focusing browser:', error);
      return false;
    }
  }

  /**
   * Check if F1 game is running
   */
  isF1GameRunning(): boolean {
    try {
      const windows = windowManager.getWindows();
      return windows.some(w =>
        w.getTitle().toLowerCase().includes(this.f1GameWindowTitle.toLowerCase())
      );
    } catch (error) {
      logger.error('Error checking F1 game status:', error);
      return false;
    }
  }

  /**
   * List all windows for debugging
   */
  listAllWindows(): void {
    try {
      const windows = windowManager.getWindows();
      logger.debug('Active windows:', windows.map(w => w.getTitle()));
    } catch (error) {
      logger.error('Error listing windows:', error);
    }
  }
}
