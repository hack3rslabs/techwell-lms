const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { trackEvent } = require('../workflow-engine/AICore');
const voiceAgent = require('./VoiceAgent');

/**
 * Jio SIM Modem Bridge
 * 
 * Usage: 
 * Set the COM_PORT environment variable to your modem's COM port.
 * Set the WS_URL to your deployed backend (e.g. wss://techwell.co.in/api/voice-stream)
 * Example: COM_PORT=COM3 WS_URL=wss://techwell.co.in/api/voice-stream node ModemBridge.js
 */

const comPortName = process.env.COM_PORT || 'COM3';
const wsUrl = process.env.WS_URL || 'ws://localhost:5000/api/voice-stream';
const baudRate = 115200;

class ModemBridge {
    constructor(port, baud) {
        this.portName = port;
        this.baudRate = baud;
        this.serialPort = null;
        this.parser = null;
        this.isCallActive = false;
        this.currentCaller = null;
        this.ws = null;
    }

    start() {
        console.log(`[Modem Bridge] Attempting to connect to Jio Modem on ${this.portName}...`);
        console.log(`[Modem Bridge] AI WebSocket Target: ${wsUrl}`);
        
        try {
            this.serialPort = new SerialPort({ path: this.portName, baudRate: this.baudRate });
            this.parser = this.serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

            this.serialPort.on('open', () => {
                console.log(`[Modem Bridge] Connected to ${this.portName}. Initializing...`);
                
                // Initialize the modem
                this.sendCommand('ATZ'); // Reset
                
                setTimeout(() => {
                    this.sendCommand('AT+CLIP=1'); // Enable Caller ID presentation
                }, 1000);
            });

            this.serialPort.on('error', (err) => {
                console.error(`[Modem Bridge Error]: ${err.message}`);
                console.log("Please check your Windows Device Manager to ensure you have the correct COM Port.");
            });

            this.parser.on('data', (data) => {
                const line = String(data || '').trim();
                if (!line) return;

                console.log(`[Modem AT Response]: ${line}`);

                this.handleModemEvent(line);
            });
        } catch (error) {
            console.error(`[Modem Bridge Error]: Failed to open port ${this.portName}.`);
        }
    }

    sendCommand(cmd) {
        if (this.serialPort && this.serialPort.isOpen) {
            console.log(`[Modem AT Command]: ${cmd}`);
            this.serialPort.write(`${cmd}\r`);
        }
    }

    handleModemEvent(line) {
        // Detect Caller ID (e.g., +CLIP: "919876543210",145,,,,0)
        if (line.startsWith('+CLIP:')) {
            const matches = line.match(/\+CLIP: "([^"]+)"/);
            if (matches && matches[1]) {
                this.currentCaller = matches[1];
                console.log(`[Modem Bridge] Incoming Call Detected from: ${this.currentCaller}`);
            }
        }

        // Detect RING
        if (line === 'RING') {
            console.log(`[Modem Bridge] Phone is Ringing! Answering automatically...`);
            
            // Auto Answer
            this.sendCommand('ATA');
        }

        // Detect when call connects (often OK after ATA or a specific connection string)
        if (line === 'OK' && this.currentCaller && !this.isCallActive) {
            console.log(`[Modem Bridge] Call Answered! Handing over to AI Workflow Engine...`);
            this.isCallActive = true;
            
            // Trigger AI Workflow
            trackEvent('INCOMING_CALL', { phone: this.currentCaller });
            
            // Start Local Voice Agent Conversational Loop
            voiceAgent.startNewCall(this.currentCaller);
            
            // Wait a moment for connection, then speak the greeting
            setTimeout(async () => {
                const greeting = "Hello! You have reached Techwell. How can I help you today?";
                console.log(`[Modem Bridge -> Voice Agent] Sending initial greeting...`);
                // In a fully native audio setup, this would trigger the TTS playback immediately.
                // For now, it logs the intent.
                
                // Example of simulating the loop:
                // voiceAgent.simulateAudioLoop(null);
            }, 2000);
        }

        // Detect Call End (e.g., NO CARRIER, BUSY, or +CIEV indicating call dropped)
        if (line === 'NO CARRIER' || line.includes('+CIEV: 1,0')) {
            if (this.isCallActive) {
                console.log(`[Modem Bridge] Call ended by remote party.`);
            }
            this.isCallActive = false;
            this.currentCaller = null;
        }
    }

    hangUp() {
        console.log(`[Modem Bridge] Hanging up call...`);
        this.sendCommand('ATH');
        this.isCallActive = false;
        this.currentCaller = null;
    }
}

// Auto-start if run directly
if (require.main === module) {
    const bridge = new ModemBridge(comPortName, baudRate);
    bridge.start();
}

module.exports = ModemBridge;
