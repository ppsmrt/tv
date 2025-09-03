const fs = require('fs');
const admin = require('firebase-admin');

// Load Firebase service account
const serviceAccount = require('../../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tamilgeo-d10d6-default-rtdb.firebaseio.com"
});

const db = admin.database();

async function generateM3U() {
  const snapshot = await db.ref('channels').once('value');
  const channels = snapshot.val();

  let content = "#EXTM3U\n";

  for (const key in channels) {
    const ch = channels[key];
    content += `#EXTINF:-1 tvg-name="${ch.name}" group-title="${ch.category}" tvg-logo="${ch.logo}",${ch.name}\n`;
    content += `${ch.stream}\n`;
  }

  // Save playlist.m3u in repo root
  fs.writeFileSync('playlist.m3u', content);
  console.log("playlist.m3u updated successfully!");
}

generateM3U();
