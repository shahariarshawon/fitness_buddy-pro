import express from "express"
const app = express.json()

app.get("/", (req, res) => {
    res.send("Fitness API is working...");
})