import express from 'express';
import multer from 'multer';
import path from 'path';
import usuariosRoutes from './routes/usuarios.routes.js';
import museosRoutes from './routes/museos.routes.js';
import reservasRoutes from './routes/reservas.routes.js';
import administradoresRoutes from './routes/administradores.routes.js';
import chatboxRoutes from './routes/chatbox.routes.js';

const app = express();

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', usuariosRoutes);
app.use('/api', museosRoutes);
app.use('/api', reservasRoutes);
app.use('/api', administradoresRoutes);
app.use('/api', chatboxRoutes);

// Ruta para subir una imagen
app.post('/api/upload', upload.single('image'), (req, res) => {
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

export default app;