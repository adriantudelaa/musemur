import express from 'express';
import path from 'path';

import usuariosRoutes from './routes/usuarios.routes.js';
import museosRoutes from './routes/museos.routes.js';
import reservasRoutes from './routes/reservas.routes.js';
import administradoresRoutes from './routes/administradores.routes.js';
import chatboxRoutes from './routes/chatbox.routes.js';
import exposicionesRoutes from './routes/exposiciones.routes.js';

const app = express();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', usuariosRoutes);
app.use('/api', museosRoutes);
app.use('/api', reservasRoutes);
app.use('/api', administradoresRoutes);
app.use('/api', chatboxRoutes);
app.use('/api', exposicionesRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

export default app;
