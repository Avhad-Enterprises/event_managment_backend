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
            table.increments('booking_id').primary();
            table.integer('event_id').notNullable();
            table.string('ticket_id').nullable();
            table.integer("user_id").nullable().references("user_id").inTable("users").onDelete("SET NULL");
            table.string('ticket_type').nullable();
            table.integer('quantity').notNullable();

            // Replaced these with ticket_holders
            table.specificType('ticket_holders', 'jsonb').nullable();

            // parent data (for filters/search)
            table.string('primary_name').nullable();
            table.string('primary_email').nullable();
            table.string('primary_phone').nullable();

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
