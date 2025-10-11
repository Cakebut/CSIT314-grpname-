import { Router } from 'express'
import { db } from "../index"
import { personInNeedTable } from "../db/schema/personInNeed"
import { eq, and } from "drizzle-orm" // Import Drizzle operators

export const userAdminRouter = Router()

// Create Account (Register)
userAdminRouter.post("/api/person-in-need", async (req, res) => {
    const usernameToUse = req.body.username
    const passwordToUse = req.body.password

    try {
        await db.insert(personInNeedTable).values({
            username: usernameToUse,
            password: passwordToUse
        })
        return res.status(201).json({ message: "Account created" })
    }
    catch (err) {
        console.error("Error: ", err)
        return res.status(500).json({ error: "Account creation failed" })
    }
})


// Login
userAdminRouter.post("/api/login", async (req, res) => {
    const { username, password } = req.body
    try {
        // Use Drizzle ORM's eq and and operators for filtering
        const user = await db.select().from(personInNeedTable)
            .where(
                and(
                    eq(personInNeedTable.username, username),
                    eq(personInNeedTable.password, password)
                )
            )
            .limit(1)

        if (user.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" })
        }
        (req.session as any).username = username // Quick fix for session typing
        return res.json({ message: "Logged in" })
    } catch (err) {
        console.error("Login error: ", err)
        return res.status(500).json({ error: "Login failed" })
    }
})


// Logout
userAdminRouter.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" })
    })
})