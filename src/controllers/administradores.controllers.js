import { pool } from "../db.js";

// Helper function to handle database queries
const queryDatabase = async (query, params) => {
    try {
        return await pool.query(query, params);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Database connection was refused');
        } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            throw new Error('Database connection was lost');
        } else {
            throw new Error('Database query failed');
        }
    }
};

export const createAdmin = async (req, res) => {
    const { user_first_name, user_surname, username, user_phone, user_email, user_dni, user_pswrd, id_museo } = req.body;

    if (!user_first_name || !user_surname || !username || !user_phone || !user_email || !user_dni || !user_pswrd || !id_museo) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        // Create new user with role admin
        const [result] = await queryDatabase(
            "INSERT INTO usuarios (user_first_name, user_surname, username, user_phone, user_email, user_dni, user_pswrd, user_rol) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
            [user_first_name, user_surname, username, user_phone, user_email, user_dni, user_pswrd]
        );

        const id_user = result.insertId;

        // Link admin to museum
        const [adminResult] = await queryDatabase(
            "INSERT INTO admin (id_admin, id_museo) VALUES (?, ?)",
            [id_user, id_museo]
        );

        res.status(201).json({ message: 'Administrador registrado exitosamente', id_user, id_museo });
    } catch (error) {
        console.error('Error al crear administrador:', error);
        if (error.message.includes('Duplicate entry')) {
            if (error.message.includes('username')) {
                res.status(409).json({ message: 'El nombre de usuario ya existe' });
            } else if (error.message.includes('user_dni')) {
                res.status(409).json({ message: 'El DNI ya existe' });
            } else {
                res.status(500).json({ message: 'Error al crear administrador' });
            }
        } else {
            res.status(500).json({ message: 'Error al crear administrador' });
        }
    }
};

export const getAdmin = async (req, res) => {
    try {
        const [result] = await queryDatabase("SELECT * from admin;");
        if (result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron administradores' });
        }
        res.json(result[0]);
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener administradores', error: error.message });
    }
};

export const getAdminByMuseum = async (req, res) => {
    const { museum_name } = req.body;
    if (!museum_name) {
        return res.status(400).json({ message: 'Nombre del museo es requerido' });
    }

    try {
        const [museum] = await queryDatabase("SELECT * FROM museos WHERE museum_name = ?", [museum_name]);
        if (museum.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }
        const museum_id = museum[0].id_museo;

        const [admins] = await queryDatabase("SELECT * FROM admin WHERE id_museo = ?", [museum_id]);
        if (admins.length === 0) {
            return res.status(404).json({ message: 'No se encontraron administradores para este museo' });
        }
        res.json(admins);
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener administradores por museo', error: error.message });
    }
};

export const updateAdmin = async (req, res) => {
    const { user_dni, old_museum_name, new_museum_name } = req.body;
    if (!user_dni || !old_museum_name || !new_museum_name) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [user] = await queryDatabase("SELECT * FROM usuarios WHERE user_dni = ?", [user_dni]);
        if (user.length === 0 || user[0].user_rol === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const user_res = user[0];

        const [oldMuseum] = await queryDatabase("SELECT * FROM museos WHERE museum_name = ?", [old_museum_name]);
        if (oldMuseum.length === 0) {
            return res.status(404).json({ message: 'Museo antiguo no encontrado' });
        }
        const old_museum_id = oldMuseum[0].id_museo;

        const [newMuseum] = await queryDatabase("SELECT * FROM museos WHERE museum_name = ?", [new_museum_name]);
        if (newMuseum.length === 0) {
            return res.status(404).json({ message: 'Museo nuevo no encontrado' });
        }
        const new_museum_id = newMuseum[0].id_museo;

        await queryDatabase("UPDATE admin SET id_museo = ? WHERE id_admin = ? AND id_museo = ?", [new_museum_id, user_res.id_user, old_museum_id]);
        res.status(200).json({
            message: `Administrador ${user_res.username} actualizado correctamente del museo ${old_museum_name} al museo ${new_museum_name}`,
        });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al actualizar el administrador', error: error.message });
    }
};


