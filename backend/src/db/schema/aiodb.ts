import { serial, pgTable, varchar, uniqueIndex, boolean, integer, text, timestamp } from 'drizzle-orm/pg-core'

export const useraccountTable = pgTable(
    'users',
    {
        id: serial().primaryKey(),
        username: varchar({ length: 64 }).notNull().unique(),
        password: varchar({ length: 64 }).notNull(),
        roleid: integer().notNull().references(() => roleTable.id), // Add this line
        issuspended: boolean().notNull().default(false),
    },
    // table => [ uniqueIndex().on(table.label) ]
)

export const roleTable = pgTable(
    'roles',
    {
        id: serial().primaryKey(),
        label: varchar({ length: 64 }).notNull().unique(),
        issuspended: boolean().notNull().default(false),
    },
    // table => [ uniqueIndex().on(table.label) ]
)


export const service_typeTable = pgTable(
    'service_type',
    {
        id: serial().primaryKey(), //Medical , transport ,household assistants
        name: varchar({ length: 64 }).notNull().unique(),
    },
    // table => [ uniqueIndex().on(table.label) ]
)

export const csr_requestsTable = pgTable(
    'csr_requests',
    {
        pin_id: integer().notNull().references(() => useraccountTable.id),
        csr_id: integer().notNull().references(() => useraccountTable.id),

        categoryID: integer().notNull().references(() => service_typeTable.id),
        message: text().notNull(),
        requestedAt: timestamp().notNull().defaultNow(),
        status: varchar({ length: 32 }).notNull().default('Pending'), // e.g., Pending, In Progress, Completed
    },
    // table => [ uniqueIndex().on(table.label) ]
)


// Ad-hoc volunteers linked to a PIN (not necessarily users)
// volunteer name feature removed


