import express from "express"
import usuariosRoutes from "./routes/usuarios.routes.js"
import museosRoutes from "./routes/museos.routes.js"
import reservasRoutes from "./routes/reservas.routes.js"
import administradoresRoutes from "./routes/administradores.routes.js"
import chatboxRoutes from "./routes/chatbox.routes.js"
import {PORT} from './config.js'

const app = express()

app.use(express.json())

app.use(usuariosRoutes)
app.use(museosRoutes)
app.use(reservasRoutes)
app.use(administradoresRoutes)
app.use(chatboxRoutes)

app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" })
})

export default app