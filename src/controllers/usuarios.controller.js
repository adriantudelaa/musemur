import { pool } from "../db.js";
import nodemailer from "nodemailer"; // Asegúrate de tener nodemailer instalado

export const seeUsers = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * from usuarios;");
        res.json(result);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

export const createUser = async (req, res) => {
    const { user_first_name, user_surname, username, user_phone, user_email, user_dni, user_pswrd, user_rol } = req.body;
    
    if (!user_first_name || !user_surname || !username || !user_phone || !user_email || !user_dni || !user_pswrd) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        const [rows] = await pool.query("INSERT INTO usuarios VALUES (0, ?, ?, ?, ?, ?, ?, ?, 0)",
            [user_first_name, user_surname, username, user_phone, user_email, user_dni, user_pswrd]);
        res.status(201).json({
            user_first_name,
            user_surname,
            username,
            user_phone,
            user_email,
            user_dni,
            user_pswrd
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

export const updateUserData = async (req, res) => {
    const { user_first_name, user_surname, username, user_phone, user_email } = req.body;
    
    if (!user_first_name || !user_surname || !username || !user_phone || !user_email) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        const [rows] = await pool.query("UPDATE usuarios SET user_first_name = ?, user_surname = ?, username = ?, user_phone = ?, user_email = ? WHERE user_email = ?",
            [user_first_name, user_surname, username, user_phone, user_email, user_email]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({
            user_first_name,
            user_surname,
            username,
            user_phone,
            user_email
        });
    } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
        res.status(500).json({ message: 'Error al actualizar datos del usuario' });
    }
};

export const updateUserPswrd = async (req, res) => {
    const { user_pswrd, user_email } = req.body;
    
    if (!user_pswrd || !user_email) {
        return res.status(400).json({ message: 'Se requiere usuario y contraseña' });
    }

    try {
        const [rows] = await pool.query("UPDATE usuarios SET user_pswrd = ? WHERE user_email = ?",
            [user_pswrd, user_email]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json({
            message: 'Contraseña actualizada correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({ message: 'Error al actualizar contraseña' });
    }
};

export const deleteUser = async (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        return res.status(400).json({ message: 'Se requiere nombre de usuario' });
    }

    try {
        const [rows] = await pool.query("DELETE FROM usuarios WHERE username = ? AND user_rol = 0",
            [username]);

        const [users] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = users[0];

        if (user.user_rol === 1) {
            return res.status(401).json({ message: 'No puedes eliminar un usuario administrador' });
        }

        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            message: 'Usuario ' + username + ' eliminado'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

export const loginUser = async (req, res) => {
    const { user_email, user_pswrd } = req.body;

    if (!user_email || !user_pswrd) {
        return res.status(400).json({ message: 'Se requiere usuario y contraseña' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE user_email = ?', [user_email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario inexistente' });
        }

        const user = rows[0];

        if (user.user_pswrd !== user_pswrd) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        res.status(200).json({ message: 'Iniciado sesión como ' + user.username });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const loginAdmin = async (req, res) => {
    const { user_dni, user_pswrd } = req.body;

    if (!user_dni || !user_pswrd) {
        return res.status(400).json({ message: 'Se requiere DNI y contraseña' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE user_dni = ?', [user_dni]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario inexistente' });
        }

        const user = rows[0];

        if (user.user_pswrd !== user_pswrd) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        if (!user.user_rol) {
            return res.status(403).json({ message: 'Acceso denegado: no es administrador' });
        }

        res.status(200).json({ message: 'Iniciado sesión como administrador ' + user.username });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'musemur.info@gmail.com', // Cambia esto por tu correo
        pass: 'Musemur0606*', // Cambia esto por tu contraseña
    },
});

export const resetPassword = async (req, res) => {
    const { user_email } = req.body;

    if (!user_email) {
        return res.status(400).json({ message: 'Se requiere correo electrónico' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE user_email = ?', [user_email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = rows[0];
        const resetToken = Math.random().toString(36).substr(2); // Generar un token simple

        // Configurar el correo
        const mailOptions = {
            from: 'tuemail@gmail.com',
            to: user_email,
            subject: 'Recuperación de contraseña',
            text: `Hola ${user.username},\n\nPara restablecer tu contraseña, por favor usa el siguiente token: ${resetToken}\n\nGracias.`,
        };

        // Enviar el correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                return res.status(500).json({ message: 'Error al enviar el correo de recuperación' });
            } else {
                return res.status(200).json({ message: 'Correo de recuperación enviado' });
            }
        });
    } catch (error) {
        console.error('Error al recuperar contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};