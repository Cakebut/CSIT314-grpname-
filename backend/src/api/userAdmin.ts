
// import { app, db } from "../index"
// import { personInNeedTable } from "../db/schema/personInNeed"

// app.post("/api/person-in-need", async (req, res) => {
//     const usernameToUse = req.body.username
//     const passwordToUse = req.body.password

//     await db.insert(personInNeedTable).values({
//         username: usernameToUse,
//         password: passwordToUse
//     })

//     res.send(200)
// })