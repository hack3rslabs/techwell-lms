const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

class WhatsAppWebManager {
  constructor() {
    this.client = null;
    this.qrCodeDataUrl = null;
    this.isConnected = false;
    this.isInitializing = false;
  }

  async initialize() {
    if (this.client || this.isInitializing) return;
    this.isInitializing = true;
    
    console.log('[WhatsApp Web] Initializing client...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    });

    this.client.on('qr', async (qr) => {
      console.log('[WhatsApp Web] QR Code Received! Scan it in the dashboard.');
      try {
        this.qrCodeDataUrl = await qrcode.toDataURL(qr);
        this.isConnected = false;
      } catch (err) {
        console.error('[WhatsApp Web] Failed to generate QR code data URL', err);
      }
    });

    this.client.on('ready', () => {
      console.log('[WhatsApp Web] Client is ready and connected!');
      this.isConnected = true;
      this.qrCodeDataUrl = null;
    });

    this.client.on('authenticated', () => {
      console.log('[WhatsApp Web] Authenticated successfully!');
    });

    this.client.on('auth_failure', msg => {
      console.error('[WhatsApp Web] Authentication failure', msg);
      this.isConnected = false;
    });

    this.client.on('disconnected', (reason) => {
      console.log('[WhatsApp Web] Client disconnected:', reason);
      this.isConnected = false;
      this.client.destroy();
      this.client = null;
      this.isInitializing = false;
      // Restart initialization
      this.initialize();
    });

    try {
      await this.client.initialize();
    } catch (err) {
      console.error('[WhatsApp Web] Failed to initialize client:', err);
      this.isInitializing = false;
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      qrCode: this.qrCodeDataUrl
    };
  }

  async logout() {
    if (this.client) {
      await this.client.logout();
      this.isConnected = false;
      this.qrCodeDataUrl = null;
    }
  }

  async sendMessage(to, body) {
    if (!this.isConnected || !this.client) {
      throw new Error("WhatsApp Web client is not connected. Please scan the QR code.");
    }

    // Format phone number to WhatsApp ID (e.g., 919876543210@c.us)
    const formattedNumber = to.replace(/[^0-9]/g, '') + '@c.us';
    
    try {
      const msg = await this.client.sendMessage(formattedNumber, body);
      console.log(`[WhatsApp Web] Sent message to ${formattedNumber}`);
      return { success: true, messageId: msg.id.id };
    } catch (error) {
      console.error(`[WhatsApp Web] Failed to send message to ${formattedNumber}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new WhatsAppWebManager();
