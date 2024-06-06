import { pool } from "../db.js";

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

export const getReservas = async (req, res) => {
    try {
        const query = `
        SELECT r.id_reserva AS id, m.museum_name AS museo, r.reserva_date AS fecha, r.reserva_hour AS hora,
        r.reserva_people AS personas, u.user_first_name AS nombre_usuario, u.user_email AS email_usuario, r.reserva_cancel AS cancelada
        FROM reservas r
        JOIN museos m ON r.id_museo = m.id_museo
        JOIN usuarios u ON r.id_user = u.id_user;
        `;

        const [result] = await queryDatabase(query);

        const formattedResult = result.map(reserva => ({
            id: reserva.id.toString(), // Convert id to string
            museo: reserva.museo,
            fecha: reserva.fecha.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            detalles: `Reserva para ${reserva.personas} personas a las ${reserva.hora}`,
            usuario: {
                nombre: reserva.nombre_usuario,
                email: reserva.email_usuario
            },
            cancelada: Boolean(reserva.cancelada) // Convert to boolean
        }));

        res.json(formattedResult);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
    }
};


export const getReservasByUser = async (req, res) => {
    const { user_dni } = req.body;
    if (!user_dni) {
        return res.status(400).json({ message: 'DNI de usuario es requerido' });
    }
    try {
        const [userResult] = await pool.query("SELECT id_user FROM usuarios WHERE user_dni = ?", [user_dni]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const id_user = userResult[0].id_user;
        const [result] = await pool.query("SELECT * FROM reservas WHERE id_user = ?;", [id_user]);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener reservas por usuario:', error);
        res.status(500).json({ message: 'Error al obtener reservas por usuario' });
    }
};

export const getReservasByAdmin = async (req, res) => {
    const { admin_dni } = req.body;
    if (!admin_dni) {
        return res.status(400).json({ message: 'DNI del administrador es requerido' });
    }

    try {
        const [adminResult] = await pool.query("SELECT id_user, id_museo FROM usuarios u JOIN admin a ON u.id_user = a.id_admin WHERE u.user_dni = ?", [admin_dni]);
        if (adminResult.length === 0) {
            return res.status(404).json({ message: 'Administrador no encontrado' });
        }

        const id_museo = adminResult[0].id_museo;
        const [museoResult] = await pool.query("SELECT museum_name FROM museos WHERE id_museo = ?", [id_museo]);
        const museum_name = museoResult[0].museum_name;

        const [result] = await pool.query("SELECT * FROM reservas WHERE id_museo = ?;", [id_museo]);
        res.json({ museum_name, reservas: result });
    } catch (error) {
        console.error('Error al obtener reservas por administrador:', error);
        res.status(500).json({ message: 'Error al obtener reservas por administrador' });
    }
};

export const postReservas = async (req, res) => {
    const userId = req.userId; // Obtén el ID del usuario autenticado desde el token
    const { museum_name, reserva_date, reserva_hour, reserva_people } = req.body;

    if (!userId || !museum_name || !reserva_date || !reserva_hour || !reserva_people) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
        const [museoResult] = await pool.query("SELECT id_museo FROM museos WHERE museum_name = ?", [museum_name]);
        if (museoResult.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        const id_museo = museoResult[0].id_museo;

        const [rows] = await pool.query("INSERT INTO reservas (id_user, id_museo, reserva_date, reserva_hour, reserva_people) VALUES (?, ?, ?, ?, ?)",
            [userId, id_museo, reserva_date, reserva_hour, reserva_people]);
        res.status(201).json({ message: 'Reserva creada exitosamente', reserva: rows.insertId });
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({ message: 'Error al crear reserva' });
    }
};

export const putReservas = async (req, res) => {
    const userId = req.userId; // Obtén el ID del usuario autenticado desde el token
    const { id_reserva, cancelada } = req.body;

    if (!id_reserva || typeof cancelada !== 'boolean') {
        return res.status(400).json({ message: 'ID de reserva y estado de cancelación son requeridos' });
    }

    try {
        const [reservaResult] = await pool.query("SELECT id_user FROM reservas WHERE id_reserva = ?", [id_reserva]);
        if (reservaResult.length === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        if (reservaResult[0].id_user !== userId) {
            return res.status(403).json({ message: 'No autorizado para cancelar esta reserva' });
        }

        const [rows] = await pool.query("UPDATE reservas SET reserva_cancel = ? WHERE id_reserva = ?", [cancelada, id_reserva]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        res.json({ message: 'Reserva cancelada exitosamente' });
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        res.status(500).json({ message: 'Error al cancelar reserva' });
    }
};

export const deleteReservaByAdmin = async (req, res) => {
    const { id_reserva } = req.body;
    if (!id_reserva) {
        return res.status(400).json({ message: 'ID de la reserva es requerido' });
    }

    try {
        const [reservaResult] = await queryDatabase("SELECT * FROM reservas WHERE id_reserva = ?", [id_reserva]);
        if (reservaResult.length === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        const [rows] = await queryDatabase("DELETE FROM reservas WHERE id_reserva = ?", [id_reserva]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        res.json({ message: 'Reserva eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar reserva por administrador:', error);
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al eliminar reserva por administrador', error: error.message });
    }
};

export const getUserReservations = async (req, res) => {
    const userId = req.userId; // Este id debe estar disponible a través del middleware de autenticación

    try {
        const [rows] = await pool.query(
            `SELECT r.id_reserva AS id, 
                    m.museum_name AS museo, 
                    r.reserva_date AS fecha, 
                    r.reserva_hour AS hora,
                    r.reserva_people AS personas, 
                    u.user_first_name AS nombre_usuario, 
                    u.user_email AS email_usuario, 
                    r.reserva_cancel AS cancelada
             FROM reservas r
             JOIN museos m ON r.id_museo = m.id_museo
             JOIN usuarios u ON r.id_user = u.id_user
             WHERE r.id_user = ?`, 
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron reservas para este usuario' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error al obtener reservas' });
    }
};
