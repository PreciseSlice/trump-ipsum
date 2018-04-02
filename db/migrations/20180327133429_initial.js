exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('remarks', table => {
      table.increments('id').primary();
      table.string('title');
      table.string('topic');
      table.string('date');
      table.timestamps(true, true);
    }),
    knex.schema.createTable('paragraphs', table => {
      table.increments('id').primary();
      table.string('length');
      table.text('text');
      table.integer('remarks_id').unsigned();
      table.foreign('remarks_id').references('remarks.id').onDelete('CASCADE')
      table.timestamps(true, true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('paragraphs'),
    knex.schema.dropTable('remarks')
  ]);
};
