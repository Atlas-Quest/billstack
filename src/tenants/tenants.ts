import sql from "../services/db.ts";
import { CreateTenantInput } from "./types.ts";

export const createTenant = async ({ name, userId }: CreateTenantInput) => {
  const uuid = crypto.randomUUID();

  if (!name?.trim()) throw new Error("TENANT NAME REQUIRED");
  if (!userId?.trim()) throw new Error("USER ID REQUIRED");

  const [user] = await sql<{ id: string }[]>`
  select id
  from users
  where id = ${userId}
  limit 1
`;
  if (!user) throw new Error("USER NOT FOUND");

  const tenants = await sql`
      insert into tenants
        (id, name, user_id)
      values
        (${uuid}, ${name}, ${userId})
      returning id, name, user_id
    `;
  return tenants;
};
