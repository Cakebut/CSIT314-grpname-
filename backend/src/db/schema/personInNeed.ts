import { serial, pgTable, varchar, uniqueIndex, boolean } from 'drizzle-orm/pg-core'

export const personInNeedTable = pgTable(
    'person_in_need',
    {
        id: serial().primaryKey(),
        username: varchar({ length: 64 }).notNull().unique(),
        password: varchar({ length: 64 }).notNull(),
        role: varchar ({ length:64 }).notNull(), // Add this line
    },
    // table => [ uniqueIndex().on(table.label) ]
)


