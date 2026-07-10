const fetch = require('node-fetch');
fetch('https://express.adobe.com/publishedV2/urn:aaid:sc:AP:137ce0c1-3ea4-50ae-912e-50fa0aff7bf8')
  .then(r => r.text())
  .then(t => {
    const match = t.match(/og:image" content="([^"]+)"/i);
    console.log(match ? match[1] : 'No image found');
  })
  .catch(console.error);
