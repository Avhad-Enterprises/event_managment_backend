import DB from "./index.schema";

export const USERS_TABLE = "users";

export const seed = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      console.log("Dropping Tables");
      await DB.schema.dropTable(USERS_TABLE);
      console.log("Dropped Tables");
    }
    console.log("Seeding Tables");
    // await DB.raw("set search_path to public")
    await DB.schema.createTable(USERS_TABLE, (table) => {
      table.increments("user_id").primary();
      table.string("first_name");
      table.string("last_name");
      table.string("profile_picture");
      table.string("phone_number");
      table.string("email").unique();
      table.string("password");

      table.string("address_line_first");
      table.string("address_line_second");
      table.string("city");
      table.string("state");
      table.string("country");
      table.string("pincode");
      table.enu("role", ["super_admin", "admin", "customer"]).defaultTo("customer");
      table.boolean("email_notifications").defaultTo(true);
      table.text("tags", "jsonb").nullable();
      table.text("notes", "jsonb").nullable();
      table.boolean("is_active").defaultTo(true);
      table.integer("created_by").nullable();
      table.timestamp("created_at").defaultTo(DB.fn.now());
      table.timestamp("updated_at").defaultTo(DB.fn.now());
      table.integer("updated_by").nullable();
      table.boolean("is_deleted").defaultTo(false);
      table.integer("deleted_by").nullable();
      table.timestamp("deleted_at").nullable();
    });


    console.log("Finished Seeding Tables");
    console.log("Creating Triggers");
    await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${USERS_TABLE}
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
