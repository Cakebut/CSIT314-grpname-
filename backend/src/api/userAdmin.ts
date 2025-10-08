import { Router } from 'express'
import { app, db } from "../index"
import { personInNeedTable } from "../db/schema/personInNeed"

export const userAdminRouter = Router()

userAdminRouter.post("/api/person-in-need", async (req, res) => {
    const usernameToUse = req.body.username
    const passwordToUse = req.body.password

    try {
        await db.insert(personInNeedTable).values({
            username: usernameToUse,
            password: passwordToUse
        })
    }
    catch (err) {
        console.error("Error: ", err)
    }
    res.send(200)
})

// userAdminRouter.get('/api/users', ....)