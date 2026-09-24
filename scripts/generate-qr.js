const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const GAME_URL = 'https://dipanwitasarkar.github.io/Pattern-Paradox/';
const OUTPUT_PATH = path.join(__dirname, '../public/qr-code.png');

console.log('Generating QR code for:', GAME_URL);

QRCode.toFile(OUTPUT_PATH, GAME_URL, {
  width: 300,
  margin: 2,
  color: {
    dark: '#667eea',
    light: '#ffffff'
  }
}, (error) => {
  if (error) {
    console.error('Error generating QR code:', error);
    process.exit(1);
  }
  console.log('QR code generated successfully!');
  console.log('Saved to:', OUTPUT_PATH);
  process.exit(0);
});