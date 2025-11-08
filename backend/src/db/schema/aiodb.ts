import { serial, pgTable, varchar, uniqueIndex, boolean, integer, text, timestamp } from 'drizzle-orm/pg-core';

 
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
        deleted: boolean().notNull().default(false),
    },
    // table => [ uniqueIndex().on(table.label) ]
)

export const csr_requestsTable = pgTable(
    'csr_requests', //PIN ACCEPT CSR REQUESTS TABLE
    {
        pin_request_id: integer().notNull().references(() => pin_requestsTable.id),
        csr_id: integer().notNull().references(() => useraccountTable.id),
        message: text().notNull(),
        requestedAt: timestamp().notNull().defaultNow(),
        interestedAt: timestamp().notNull().defaultNow(),
        status: varchar({ length: 32 }).notNull().default('Pending'), // e.g., Pending, In Progress, Completed
    },
    table => [ uniqueIndex().on(table.csr_id, table.pin_request_id) ]
)


// CSR Rep <-> PIN Request Shortlist Join Table (Many-to-Many)
export const csr_shortlistTable = pgTable(
    'csr_shortlist', // Favourite
    {
        csr_id: integer().notNull().references(() => useraccountTable.id),
        pin_request_id: integer().notNull().references(() => pin_requestsTable.id),
        shortlistedAt: timestamp().notNull().defaultNow(),
    },
    table => [ uniqueIndex().on(table.csr_id, table.pin_request_id) ]
);

// CSR Rep <-> PIN Request Interested Join Table (Many-to-Many, separate from shortlist)
export const csr_interestedTable = pgTable(
    'csr_interested', // CSR offer to help PIN
    {
        csr_id: integer().notNull().references(() => useraccountTable.id),
        pin_request_id: integer().notNull().references(() => pin_requestsTable.id),
        interestedAt: timestamp().notNull().defaultNow(),
    },
    table => [ uniqueIndex().on(table.csr_id, table.pin_request_id) ]
);



// PIN REQUESTS TABLE
export const pin_requestsTable = pgTable(
    'pin_requests',
    {
        id: serial().primaryKey(),
        pin_id: integer().notNull().references(() => useraccountTable.id),
        csr_id: integer().references(() => useraccountTable.id), // nullable, only one CSR can be assigned
        title: varchar({ length: 128 }).notNull(),
        categoryID: integer().notNull().references(() => service_typeTable.id),
        requestType: varchar({ length: 64 }).notNull(),
        message: text(),
        locationID: integer().references(() => locationTable.id),
        urgencyLevelID: integer().references(() => urgency_levelTable.id),
        createdAt: timestamp().notNull().defaultNow(),
        status: varchar({ length: 32 }).notNull().default('Available'),
        view_count: integer().notNull().default(0),
        shortlist_count: integer().notNull().default(0),
    }
);


// Urgency Level Table
export const urgency_levelTable = pgTable(
    'urgency_level',
    {
        id: serial().primaryKey(),
        label: varchar({ length: 16 }).notNull().unique(), // e.g., Low, Medium, Urgent
    }
);

// Location Table (e.g., MRT lines)
export const locationTable = pgTable(
    'location',
    {
        id: serial().primaryKey(),
        name: varchar({ length: 64 }).notNull().unique(), // e.g., North, South, East, West
    }
);


// Audit Log Table
export const auditLogTable = pgTable(
    'audit_log',
    {
        id: serial().primaryKey(),
        actor: varchar({ length: 64 }).notNull(), // e.g. useradmin145
        action: varchar({ length: 64 }).notNull(), // e.g. create user
        target: varchar({ length: 64 }).notNull(), // e.g. User455
        timestamp: timestamp().notNull().defaultNow(),
        details: text(),
    }
);


// Notification table for PIN users
export const notificationTable = pgTable(
    'notification',
    {
        id: serial('id').primaryKey(),
        pin_id: integer().notNull().references(() => useraccountTable.id), // PIN user to notify
        type: text().notNull(), // 'shortlist' or 'interested'
        csr_id: integer().notNull().references(() => useraccountTable.id), // CSR who triggered
        pin_request_id: integer().notNull(), // Which request
        createdAt: timestamp().notNull().defaultNow(),
        read: integer().notNull().default(0), // 0 = unread, 1 = read
    }
);

// Feedback table: Each feedback links a PIN, a CSR, and a request, with rating, optional description, and date
export const feedbackTable = pgTable(
    'feedback',
    {
        id: serial().primaryKey(),
        pin_id: integer().notNull().references(() => useraccountTable.id), // PIN user
        csr_id: integer().notNull().references(() => useraccountTable.id), // CSR
        requestId: integer().notNull().references(() => pin_requestsTable.id),
        rating: integer().notNull(), // 1-5
        description: text(), // optional
        createdAt: timestamp().notNull().defaultNow(),
    }
);
// Place this at the end of the file to avoid identifier conflicts
export const passwordResetRequestsTable = pgTable(
    'password_reset_requests',
    {
        id: serial().primaryKey(),
        user_id: integer().notNull().references(() => useraccountTable.id),
        username: varchar({ length: 64 }).notNull(), // Add username for reference
        new_password: varchar({ length: 64 }).notNull(), // Should be hashed
        status: varchar({ length: 16 }).notNull().default('Pending'), // Pending, Approved, Rejected
        requested_at: timestamp().notNull().defaultNow(),
        reviewed_at: timestamp(),
        reviewed_by: integer().references(() => useraccountTable.id), // Admin user id
        admin_name: varchar({ length: 64 }), // Store admin name directly
        admin_note: text(),
    }
);

// Admin notifications table: used to notify User Admins about events like password reset requests
export const adminNotificationsTable = pgTable(
    'admin_notifications',
    {
        id: serial().primaryKey(),
        user_id: integer().notNull().references(() => useraccountTable.id), // user who triggered the notification
        username: varchar({ length: 64 }).notNull(), // username for convenience
        message: text().notNull(), // e.g., 'Request password change'
        createdAt: timestamp().notNull().defaultNow(),
        read: integer().notNull().default(0), // 0 = unread, 1 = read
    }
);
