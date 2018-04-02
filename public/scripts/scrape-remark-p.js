const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });
const fs = require('fs');

nightmare
  .goto(
    // eslint-disable-next-line
    'https://www.whitehouse.gov/briefings-statements/remarks-president-trump-signing-presidential-memorandum-targeting-chinas-economic-aggression/'
  )
  .evaluate(() => {
    const pageContent = document.querySelector('.page-content__content');

    const paragraphs = [...pageContent.querySelectorAll('p')];

    const textContent = paragraphs.map(paragraph => paragraph.innerText);

    return { textContent };
  })
  .end()
  .then(result => {
    let output = JSON.stringify(result, null, 2);

    fs.writeFile('./paragraphs.json', output, 'utf8', err => {
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
