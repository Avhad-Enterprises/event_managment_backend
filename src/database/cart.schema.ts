
import DB from './index.schema';

export const ABANDONED_CART_TABLE = 'forms';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(ABANDONED_CART_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(ABANDONED_CART_TABLE, table => {
            table.increments('id').primary(); // ID
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL'); // User ID
            table.integer('guest_id').unsigned().references('id').inTable('guests').onDelete('SET NULL'); // Guest ID
            table.specificType('product_ids', 'INTEGER[]'); // Array of Product IDs
            table.integer('quantity'); // Total quantity of all products
            table.decimal('cart_value', 10, 2); // Total cart value
            table.boolean('is_deleted').defaultTo(false);
            table.timestamps(false, true);
          
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${ABANDONED_CART_TABLE}
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


