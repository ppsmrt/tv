const express = require('express');
const admin = require('firebase-admin');
const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin
const serviceAccount = require('../../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

// Resolve masked streams
app.get('/stream', async (req, res) => {
  const id = parseInt(req.query.id);
  if (!id) return res.status(400).send("Missing ID");

  try {
    const snapshot = await db.ref('channels').once('value');
    const channels = snapshot.val();
    const keys = Object.keys(channels);
    const channelKey = keys[id - 1];
    const stream = channels[channelKey]?.stream;
    if (!stream) return res.status(404).send("Stream not found");

    // Redirect to the real stream
    res.redirect(stream);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching stream");
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
