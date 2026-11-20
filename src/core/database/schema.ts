import { defineRelations } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const todosTable = pgTable('todos', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
});

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 255 }).notNull().unique(),
});

export const relations = defineRelations({ todosTable, usersTable }, (r) => ({
  todosTable: {
    // users: r.many.usersTable()
  },
  // posts: {
  // 	author: r.one.users({
  // 		from: r.posts.ownerId,
  // 		to: r.users.id,
  // 	}),
  // }
}));

export type DatabaseType = NeonDatabase<typeof relations>;

export type User = typeof usersTable.$inferSelect;
