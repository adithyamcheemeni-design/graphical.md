const fs = require('fs');
const path = require('path');

function generateWav(filename, type) {
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const seconds = 1.5;

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

    // Generate different sounds based on type
    for (let i = 0; i < dataSize; i += 2) {
        let sample = 0;
        const t = (i / 2) / sampleRate;

        if (type === 'sine') {
            // High pitch beep
            sample = Math.sin(2 * Math.PI * 880 * t) * 10000;
        } else if (type === 'square') {
            // Buzzing sound
            sample = (Math.sin(2 * Math.PI * 220 * t) > 0 ? 1 : -1) * 5000;
        } else if (type === 'noise') {
            // Static
            sample = (Math.random() - 0.5) * 10000;
        } else if (type === 'low_sine') {
            // Low thud-like
            sample = Math.sin(2 * Math.PI * 110 * t) * 15000 * Math.exp(-3 * t);
        }

        buffer.writeInt16LE(Math.floor(sample), 44 + i);
    }

    const dir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, filename), buffer);
    console.log(`Generated ${filename} successfully`);
}

generateWav('beep.wav', 'sine');
generateWav('buzz.wav', 'square');
generateWav('static.wav', 'noise');
generateWav('thud.wav', 'low_sine');
