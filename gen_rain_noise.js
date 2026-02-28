const fs = require('fs');

const sampleRate = 44100;
const numChannels = 1;
const bitsPerSample = 16;
const seconds = 8;

const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
const blockAlign = numChannels * (bitsPerSample / 8);
const dataSize = sampleRate * numChannels * (bitsPerSample / 8) * seconds;
const chunkSize = 36 + dataSize;

const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(chunkSize, 4);
buffer.write('WAVE', 8);

// fmt subchunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bitsPerSample, 34);

// data subchunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Generate Brown Noise (simulates waterfall/heavy rain)
let lastOut = 0;
for (let i = 0; i < dataSize; i += 2) {
    let white = (Math.random() - 0.5) * 2;
    // Brown noise integration
    lastOut = (lastOut + (0.05 * white)) / 1.05;

    // Add some random larger "drops" occasionally
    let drop = 0;
    if (Math.random() < 0.001) {
        drop = (Math.random() - 0.5) * 0.5;
    }

    let sample = (lastOut + drop) * 20000;

    // Clamp
    sample = Math.max(-32768, Math.min(32767, sample));
    buffer.writeInt16LE(sample, 44 + i);
}

fs.mkdirSync('e:/NewProject/public/audio', { recursive: true });
fs.writeFileSync('e:/NewProject/public/audio/rain.wav', buffer);
console.log('Generated rain.wav using Brown Noise successfully');
