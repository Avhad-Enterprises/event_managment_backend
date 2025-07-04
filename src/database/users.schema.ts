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
      table.increments('user_id').primary();

      // Basic Info
      table.string('first_name').notNullable();
      table.string('last_name').nullable();
      table.string('username').notNullable().unique();
      table.string('email').notNullable().unique();
      table.string('phone_number').notNullable();
      table.string('password').nullable();

      // Role & Access
      table.string('role').defaultTo('attendee'); // attendee, organizer, admin
      table.string('account_type').nullable();    // optional if separate from role
      table.string('account_status').defaultTo('active'); // active, inactive, banned
      table.boolean('is_active').defaultTo(true);
      table.boolean('is_banned').defaultTo(false);

      // Profile & Settings
      table.string('profile_picture').nullable();
      table.text('bio').nullable();
      table.string('timezone').nullable();
      table.boolean('email_notifications').defaultTo(true);

      // Address
      table.string('address_line_first').nullable();
      table.string('address_line_second').nullable();
      table.string('city').nullable();
      table.string('state').nullable();
      table.string('country').nullable();
      table.string('pincode').nullable();

      // Auth and Verification
      table.boolean('email_verified').defaultTo(false);
      table.boolean('phone_verified').defaultTo(false);
      table.text('reset_token').nullable();
      table.timestamp('reset_token_expires').nullable();
      table.integer('login_attempts').defaultTo(0);
      table.timestamp('last_login_at').nullable();

      // Stats for Organizers/Attendees
      table.integer('events_created').defaultTo(0);
      table.integer('events_attended').defaultTo(0);
      table.integer('tickets_purchased').defaultTo(0);
      table.integer('total_spent').defaultTo(0);
      table.integer('total_earned').defaultTo(0);

      // Optional Booking Preferences or Details
      table.jsonb('payment_method').nullable();
      table.jsonb('payout_method').nullable();
      table.jsonb('bank_account_info').nullable();
      table.string('availability').nullable();

      // Internal Metadata
      table.text('banned_reason').nullable();
      table.timestamp('created_at').defaultTo(DB.fn.now());
      table.timestamp('updated_at').defaultTo(DB.fn.now());
      table.timestamp('updated_by').nullable();
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
