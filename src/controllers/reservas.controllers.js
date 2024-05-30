import { pool } from "../db.js";

export const getReservas = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM reservas;");
        res.json(result);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error al obtener reservas' });
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
    const { user_dni, museum_name, reserva_date, reserva_hour, reserva_people } = req.body;
    if (!user_dni || !museum_name || !reserva_date || !reserva_hour || !reserva_people) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    try {
        const [userResult] = await pool.query("SELECT id_user FROM usuarios WHERE user_dni = ?", [user_dni]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const id_user = userResult[0].id_user;

        const [museoResult] = await pool.query("SELECT id_museo FROM museos WHERE museum_name = ?", [museum_name]);
        if (museoResult.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        const id_museo = museoResult[0].id_museo;

        const [rows] = await pool.query("INSERT INTO reservas (id_user, id_museo, reserva_date, reserva_hour, reserva_people) VALUES (?, ?, ?, ?, ?)",
            [id_user, id_museo, reserva_date, reserva_hour, reserva_people]);
        res.status(201).json({ message: 'Reserva creada exitosamente', reserva: rows.insertId });
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({ message: 'Error al crear reserva' });
    }
};

export const putReservas = async (req, res) => {
    const { id_reserva, user_dni, museum_name, reserva_date, reserva_hour, reserva_people } = req.body;
    if (!id_reserva || !user_dni || !museum_name || !reserva_date || !reserva_hour || !reserva_people) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    try {
        const [userResult] = await pool.query("SELECT id_user FROM usuarios WHERE user_dni = ?", [user_dni]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const id_user = userResult[0].id_user;

        const [museoResult] = await pool.query("SELECT id_museo FROM museos WHERE museum_name = ?", [museum_name]);
        if (museoResult.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        const id_museo = museoResult[0].id_museo;

        const [rows] = await pool.query("UPDATE reservas SET id_user = ?, id_museo = ?, reserva_date = ?, reserva_hour = ?, reserva_people = ? WHERE id_reserva = ?",
            [id_user, id_museo, reserva_date, reserva_hour, reserva_people, id_reserva]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        res.json({ message: 'Reserva actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar reserva:', error);
        res.status(500).json({ message: 'Error al actualizar reserva' });
    }
};

export const deleteReservaByAdmin = async (req, res) => {
    const { admin_dni, id_reserva } = req.body;
    if (!admin_dni || !id_reserva) {
        return res.status(400).json({ message: 'DNI del administrador e ID de la reserva son requeridos' });
    }

    try {
        const [adminResult] = await pool.query("SELECT id_user, id_museo FROM usuarios u JOIN admin a ON u.id_user = a.id_admin WHERE u.user_dni = ?", [admin_dni]);
        if (adminResult.length === 0) {
            return res.status(404).json({ message: 'Administrador no encontrado' });
        }

        const id_museo = adminResult[0].id_museo;

        const [reservaResult] = await pool.query("SELECT * FROM reservas WHERE id_reserva = ? AND id_museo = ?", [id_reserva, id_museo]);
        if (reservaResult.length === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada o no pertenece a este museo' });
        }

        const [rows] = await pool.query("DELETE FROM reservas WHERE id_reserva = ?", [id_reserva]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        res.json({ message: 'Reserva eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar reserva por administrador:', error);
        res.status(500).json({ message: 'Error al eliminar reserva por administrador' });
    }
};