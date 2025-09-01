import app from "./app.mjs"

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Serveren är igång på port ${PORT}`)
})
