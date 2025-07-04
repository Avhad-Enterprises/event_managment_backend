import DB from './index.schema';

export const ROLE_PERMISSIONS_TABLE = 'role_permissions';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(ROLE_PERMISSIONS_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(ROLE_PERMISSIONS_TABLE, table => {
            table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('CASCADE');
            table.integer('permission_id').unsigned().references('id').inTable('permissions').onDelete('CASCADE');
            table.primary(['role_id', 'permission_id']);
        });

        console.log('Finished Seeding Tables');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${ROLE_PERMISSIONS_TABLE}
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
