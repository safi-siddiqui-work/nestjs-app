import { defineRelations } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
// import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const todosTable = pgTable('todos', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
});

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }),
  emailVerifiedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp(),
});

export const sessionsTable = pgTable('sessions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => usersTable.id),
  email: varchar({ length: 255 }).notNull(),
  token: varchar({ length: 255 }).notNull(),
  scope: varchar({ length: 255 }).notNull(),
  attampts: integer().default(0),
  expiresAt: timestamp().notNull(),
  sentAt: timestamp(),
  mailId: varchar({ length: 255 }),
  usedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const relations = defineRelations(
  { todosTable, usersTable, sessionsTable },
  (r) => ({
    usersTable: {
      sessions: r.many.sessionsTable({
        from: r.usersTable.id,
        to: r.sessionsTable.userId,
      }),
    },
    sessionsTable: {
      user: r.one.usersTable({
        from: r.sessionsTable.userId,
        to: r.usersTable.id,
      }),
    },
  }),
);

export type DatabaseType = NodePgDatabase<typeof relations>;

export type UserType = typeof usersTable.$inferSelect;
export type SessionType = typeof sessionsTable.$inferSelect;
