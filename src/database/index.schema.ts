import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const awsConf = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 5432,
      ssl: {
      rejectUnauthorized: false,
    }
  },
  searchPath: "public",
};

const DB = knex(awsConf);

export default DB;

// Table Names
import { USERS_TABLE } from "./users.schema";
import { EVENT_TABLE } from "./event.schema";
import { TAGS_TABLE } from "./tags.schema";
import { BOOKINGS_TABLE } from "./bookings.schema";
import { TICKET_DETAILS_TABLE } from "./ticket_details.schema";
import { DYNAMIC_FORMS_TABLE } from "./dynamic_forms.schema";
import { USERINVITATIONS } from "./userinvitations.schema";

// RABC System Tables
import { ROLES_TABLE } from "./roles.schema";
import { PERMISSIONS_TABLE } from "./permissions.schema";
import { ROLE_PERMISSIONS_TABLE } from "./role_permissions.schema";
import { USER_ROLES_TABLE } from "./user_roles.schema";

// Table Names
export const T = {
  USERS_TABLE,
  EVENT_TABLE,
  TAGS_TABLE,
  BOOKINGS_TABLE,
  TICKET_DETAILS_TABLE,
  DYNAMIC_FORMS_TABLE,
  USERINVITATIONS,
  ROLES_TABLE,
  PERMISSIONS_TABLE,
  ROLE_PERMISSIONS_TABLE,
  USER_ROLES_TABLE,
};

// Creates the procedure that is then added as a trigger to every table
// Only needs to be run once on each postgres schema
export const createProcedure = async () => {
  await DB.raw(`
      CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
      LANGUAGE plpgsql
      AS
      $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;
    `);
};

// const run = async () => {
//   createProcedure();
// };
// run();
