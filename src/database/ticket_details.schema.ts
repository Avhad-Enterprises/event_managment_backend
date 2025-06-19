import DB from './index.schema';

export const TICKET_DETAILS_TABLE = 'ticket_details';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(TICKET_DETAILS_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');

        await DB.schema.createTable(TICKET_DETAILS_TABLE, table => {
            table.increments('id').primary();
            table.string('ticket_id').notNullable();
            table.integer('booking_id').notNullable().references('booking_id').inTable('bookings').onDelete('CASCADE');

            table.string('ticket_type').nullable();
            table.string('customer_name').notNullable();
            table.string('customer_email').notNullable();
            table.string('customer_phone').nullable();
            table.string('status').defaultTo('pending');
            table.string('ticket_image_path').nullable();
            table.boolean('is_present').defaultTo(false);
            table.timestamp('check_in_time').defaultTo(DB.fn.now());
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        await DB.raw(`
          CREATE TRIGGER update_ticket_timestamp
          BEFORE UPDATE
          ON ${TICKET_DETAILS_TABLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

// exports.seed = seed;
// const run = async () => {
//     //createProcedure();
//     seed();
// };
// run();