import DB from './index.schema';
export const EVENT_TABLE = 'event';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(EVENT_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(EVENT_TABLE, table => {
            table.increments('event_id').primary();

            // Event information
            table.string('event_title').notNullable();
            table.text('event_description').notNullable();
            table.string('banner_image').notNullable();
            table.specificType('more_images', 'jsonb').nullable();
            table.string('promo_video').notNullable();
            table.string('address_line_1').notNullable();
            table.string('address_line_2').nullable();
            table.string('venue_name').notNullable();
            table.string('gate_no').nullable();
            table.string('city').notNullable();
            table.string('state').notNullable();
            table.integer('pincode').notNullable();
            table.string('map_integration').nullable();

            // SEO
            table.string('meta_title').notNullable();
            table.text('meta_description').notNullable();
            table.string('meta_url').notNullable();

            // Event date and time
            table.date('date').notNullable();
            table.time('time').nullable();
            table.string('time_zone_selector').nullable();
            table.boolean('all_day').defaultTo(false);
            table.text('tags', 'jsonb').notNullable();
            table.text('agenda', 'jsonb').nullable();
            table.integer('total_seats').notNullable();
            table.boolean('seats_remaining_indicator').defaultTo(false);
            table.integer('seats_remaining').nullable();
            table.decimal('ticket_price', 10, 2).notNullable();
            table.string('currency').notNullable();

            // Speaker details (JSON format)
            table.specificType('speaker_details', 'jsonb').nullable();

            // Event Partners (JSON format)
            table.text('sponsors', 'jsonb').nullable();
            table.text('our_partners', 'jsonb').nullable();

            // Status and Soft Delete fields
            table.integer('is_active').defaultTo(0);
            table.integer('created_by').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now())
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(true);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${EVENT_TABLE}
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
