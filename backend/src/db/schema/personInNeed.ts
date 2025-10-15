import { serial, pgTable, varchar, uniqueIndex, boolean, integer, text } from 'drizzle-orm/pg-core'

export const users = pgTable(
    'users',
    {
        id: serial().primaryKey(),
        username: varchar({ length: 64 }).notNull().unique(),
        password: varchar({ length: 64 }).notNull(),
        roleID: integer().notNull().references(() => role.id), // Add this line
    },
    // table => [ uniqueIndex().on(table.label) ]
)

export const role = pgTable(
    'roles',
    {
        id: serial().primaryKey(),
        name: varchar({ length: 64 }).notNull().unique(),
    },
    // table => [ uniqueIndex().on(table.label) ]
)


export const service_cateogry = pgTable(
    'roles',
    {
        id: serial().primaryKey(),
        name: varchar({ length: 64 }).notNull().unique(),
    },
    // table => [ uniqueIndex().on(table.label) ]
)

export const csr_requests = pgTable(
    'csr_requests',
    {
        pin_id: integer().notNull().references(() => users.id),
        csr_id: integer().notNull().references(() => users.id),

        categoryID: integer().notNull().references(() => service_cateogry.id),
        message: text().notNull(),
    },
    // table => [ uniqueIndex().on(table.label) ]
)