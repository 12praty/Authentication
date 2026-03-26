import express from "expresss"
import morgan  from "morgan"

const app =express()

app.use(express.json)
app.use(morgan("dev"))

export default app