const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });
const fs = require('fs');

nightmare
  .goto(
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
    console.log(result);

    let output = JSON.stringify(result, null, 2);

    fs.writeFile('./paragraphs.json', output, 'utf8', err => {
      if (err) {
        return console.log(err);
      }
    });
    console.log('File was saved');
  })
  .catch(function(error) {
    console.error('Search failed:', error);
  });
