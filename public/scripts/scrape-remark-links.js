const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });
const fs = require('fs');

nightmare
  .goto('https://www.whitehouse.gov/search/?s=remarks&wpsolr_range=7d')
  .evaluate(() => {
    const remarkLinks = [
      ...document.querySelectorAll('.briefing-statement__title')
    ];

    const linkData = remarkLinks.map(remarkHeader => {
      let link = remarkHeader.querySelector('a').href;

      return { link };
    });

    return linkData;
  })
  .end()
  .then(result => {
    let output = JSON.stringify(result, null, 2);

    fs.writeFile('./links.json', output, 'utf8', err => {
      if (err) {
        // eslint-disable-next-line
        return console.log(err);
      }
    });
    // eslint-disable-next-line
    console.log('File was saved');
  })
  .catch(function(error) {
    // eslint-disable-next-line
    console.error('Search failed:', error);
  });
