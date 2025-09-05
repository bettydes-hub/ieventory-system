const https = require('https');

function fetchJson(url, accessToken) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data || '{}');
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function fetchBasecampProfile(profileUrl, accessToken) {
  const json = await fetchJson(profileUrl, accessToken);
  return json;
}

module.exports = { fetchBasecampProfile };

