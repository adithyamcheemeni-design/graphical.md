const https = require('https');
const fs = require('fs');
const path = 'e:/NewProject/public/audio/rain.mp3';

const url = "https://cdn.pixabay.com/download/audio/2021/08/09/audio_8e2285a86a.mp3?filename=rain-and-thunder-16705.mp3";

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
};

function download(urlToFetch) {
    https.get(urlToFetch, options, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            console.log('Redirecting to:', response.headers.location);
            download(response.headers.location.startsWith('http') ? response.headers.location : `https://cdn.pixabay.com${response.headers.location}`);
        } else if (response.statusCode === 200) {
            const file = fs.createWriteStream(path);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('Download completed successfully.');
            });
        } else {
            console.log(`Failed with status code: ${response.statusCode}`);
        }
    }).on('error', (err) => {
        console.error('Error downloading:', err.message);
    });
}

download(url);
