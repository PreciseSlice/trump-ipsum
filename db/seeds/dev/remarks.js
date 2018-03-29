exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('paragraphs')
    .del()
    .then(() => knex('remarks').del())
    .then(() => {
      return Promise.all([
        knex('remarks')
          .insert(
            {
              title: 'The Title',
              topic: 'TOPIC ONE',
              date: '2/12/2018'
            },
            'id'
          )
          .then(remark => {
            return knex('paragraphs').insert([
              {
                remarks_id: remark.id,
                length: 'long',
                text: 'But we have one particular problem.  And I view them as a friend; I have tremendous respect for President Xi.  We have a great relationship.  They’re helping us a lot in North Korea.  And that’s China.'
              }
            ]);
          })
          .then(() => console.log('Seeding complete!'))
          .catch(error => console.log(`Error seeding data: ${error}`))
      ]);
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};
