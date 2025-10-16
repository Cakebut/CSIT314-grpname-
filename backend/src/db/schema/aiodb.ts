import { serial, pgTable, varchar, uniqueIndex, boolean, integer, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable(
    'users',
    {
        id: serial().primaryKey(),
        username: varchar({ length: 64 }).notNull().unique(),
        password: varchar({ length: 64 }).notNull(),
        roleid: integer().notNull().references(() => role.id), // Add this line
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


export const service_type = pgTable(
    'service_type',
    {
        id: serial().primaryKey(), //Medical , transport ,household assistants
        name: varchar({ length: 64 }).notNull().unique(),
    },
    // table => [ uniqueIndex().on(table.label) ]
)

export const csr_requests = pgTable(
    'csr_requests',
    {
        pin_id: integer().notNull().references(() => users.id),
        csr_id: integer().notNull().references(() => users.id),

        categoryID: integer().notNull().references(() => service_type.id),
        message: text().notNull(),
        requestedAt: timestamp().notNull().defaultNow(),
        status: varchar({ length: 32 }).notNull().default('Pending'), // e.g., Pending, In Progress, Completed
    },
    // table => [ uniqueIndex().on(table.label) ]
)