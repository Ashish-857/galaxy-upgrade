const https = require('https');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../public/textures');
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

// Sources to try
const sources = [
    'https://raw.githubusercontent.com/billykonstas/solar-system/master/src/assets/textures/',
    'https://raw.githubusercontent.com/shivam-070208/Solarsystem/master/textures/',
    'https://raw.githubusercontent.com/joshcam/mongoose-solar-system/master/public/images/'
];

const files = [
    'sun.jpg', 'mercury.jpg', 'venus.jpg', 'earth.jpg', 'mars.jpg', 'jupiter.jpg', 'saturn.jpg', 'uranus.jpg', 'neptune.jpg', 'saturn-ring.png'
];

async function downloadFile(file) {
    const dest = path.join(baseDir, file);
    if (fs.existsSync(dest)) {
        console.log(`Skipping ${file}, already exists.`);
        return true;
    }

    for (const source of sources) {
        console.log(`Trying to download ${file} from ${source}...`);
        try {
            const success = await new Promise((resolve) => {
                https.get(source + file, (res) => {
                    if (res.statusCode === 200) {
                        const fileStream = fs.createWriteStream(dest);
                        res.pipe(fileStream);
                        fileStream.on('finish', () => {
                            fileStream.close();
                            resolve(true);
                        });
                    } else if (res.statusCode === 301 || res.statusCode === 302) {
                         // Follow redirect
                         https.get(res.headers.location, (res2) => {
                             if (res2.statusCode === 200) {
                                 const fileStream = fs.createWriteStream(dest);
                                 res2.pipe(fileStream);
                                 fileStream.on('finish', () => {
                                     fileStream.close();
                                     resolve(true);
                                 });
                             } else {
                                 resolve(false);
                             }
                         });
                    } else {
                        resolve(false);
                    }
                }).on('error', () => resolve(false));
            });
            if (success) {
                console.log(`Successfully downloaded ${file}`);
                return true;
            }
        } catch (e) {
            console.error(e);
        }
    }
    console.log(`Failed to download ${file} from all sources.`);
    return false;
}

async function downloadAll() {
    for (const file of files) {
        await downloadFile(file);
    }
    console.log('Finished downloading textures.');
}

downloadAll();
