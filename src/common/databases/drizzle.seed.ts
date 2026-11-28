import 'dotenv/config';

async function main() {
  // const db = drizzle(process.env.DATABASE_NEON_URL!) as DatabaseType;

  console.log('Seeding Started');

  // Delete user and its refrenced sessions
  // const email = 'safisiddiqui.work@gmail.com';
  // const user = await db
  //   ?.select({ id: usersTable?.id })
  //   ?.from(usersTable)
  //   ?.where(eq(usersTable?.email, email));
  // await db
  //   ?.delete(sessionsTable)
  //   ?.where(eq(sessionsTable?.userId, user?.at(0)?.id ?? 0));
  // await db?.delete(usersTable)?.where(eq(usersTable?.id, user?.at(0)?.id ?? 0));

  console.log('Seeding database...');
  // Generates 10 deterministic records per table by default
  // await seed(db, schema, { count: 20 }).refine((f) => ({
  //   users: {
  //     columns: {
  //       email: f.email(),
  //       name: f.fullName(),
  //     },
  //     with: {
  //       posts: 3, // Generates 3 related posts per user
  //     },
  //   },
  // }));

  console.log('Seeding complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
