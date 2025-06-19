import DB from "./index.schema";

export const ROLE_PERMISSIONS_TABLE = "role_permissions";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Tables");
            await DB.schema.dropTable(ROLE_PERMISSIONS_TABLE);
            console.log("Dropped Tables");
        }
        console.log("Seeding Tables");
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(ROLE_PERMISSIONS_TABLE, (table) => {
            table.increments("role_permission_id").primary();
            table.integer("user_id").notNullable();
            table.integer("role_id").notNullable();
            table.integer("permission_id").notNullable();
            table.string("section_name").notNullable();
            table.foreign("role_id").references("users.user_id").onDelete("CASCADE");
            table.foreign("permission_id").references("permissions.permission_id").onDelete("CASCADE");
            table.timestamps(true, true);
        });


        console.log("Finished Seeding Tables");
        console.log("Creating Triggers");
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${ROLE_PERMISSIONS_TABLE}
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
