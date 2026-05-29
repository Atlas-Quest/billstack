import sql from "../services/db.ts";
import { User } from "./types.ts";

export const createUser = async ({
  name,
  email,
}: Pick<User, "name" | "email">) => {
  const uuid = crypto.randomUUID();

  const users = await sql`
      insert into users
        (name, email, id)
      values
        (${name}, ${email}, ${uuid})
      returning name
    `;
  return users;
};
