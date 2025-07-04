import DB from './index.schema';

export const USER_ROLES_TABLE = 'user_roles';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(USER_ROLES_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(USER_ROLES_TABLE, table => {
            table.increments('id').primary();
            table.integer('user_id').notNullable();
            table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('CASCADE');
            table.timestamp('created_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${USER_ROLES_TABLE}
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
