import DB from './index.schema';

export const BOOKINGS_TABLE = 'bookings';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(BOOKINGS_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(BOOKINGS_TABLE, table => {
            table.increments('booking_id').primary(); // ID
            table.integer('event_id').notNullable();
            table.string('ticket_id').notNullable();

            table.string('ticket_type').nullable();
            table.integer('quantity').notNullable();
            table.string('name').notNullable();
            table.string('email_address').notNullable();
            table.string('phone_number').notNullable();
            table.string('location').nullable();
            table.string('payment_method').nullable();
            table.string('promo_code').nullable();
            table.boolean('terms_and_conditions').nullable();
            table.boolean('notify_via_email_sms').nullable();

            table.specificType('tags', 'jsonb').nullable();
            table.text('notes').nullable();
            table.decimal('ticket_price', 10, 2).notNullable();
            table.decimal('total_amount', 10, 2).notNullable();
            table.enu('booking_status', ['confirmed', 'pending', 'cancelled', 'refunded']).notNullable();
            table.string('ticket_download_link').nullable();

            // Status and Soft Delete fields
            table.integer('is_active').defaultTo(0);
            table.integer('created_by').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();
        });

        console.log('Finished Seeding Tables');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${BOOKINGS_TABLE}
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
