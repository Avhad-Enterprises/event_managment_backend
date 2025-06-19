import DB from "./index.schema";

export const PERMISSIONS_TABLE = "permissions";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Tables");
            await DB.schema.dropTable(PERMISSIONS_TABLE);
            console.log("Dropped Tables");
        }
        console.log("Seeding Tables");
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(PERMISSIONS_TABLE, (table) => {
            table.increments("permission_id").primary();
            table.string("permission_name").unique().notNullable();
            table.text("description").nullable();
            table.timestamps(true, true);
        });


        console.log("Finished Seeding Tables");
        console.log("Creating Triggers");
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${PERMISSIONS_TABLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log("Finished Creating Triggers");
    } catch (error) {
        console.log(error);
    }
};

// exports.seed = seed;
// const run = async () => {
//   //createProcedure();
//   seed();
// };
// run();
