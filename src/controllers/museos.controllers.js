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

export const getMuseosCity = async (req, res) => {
    const { museum_city } = req.body;
    if (!museum_city) {
        return res.status(400).json({ message: 'Ciudad del museo no proporcionada' });
    }

    try {
        const [result] = await queryDatabase("SELECT * from museos WHERE museum_city = ?", [museum_city]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron museos en la ciudad especificada' });
        }
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener museos por ciudad', error: error.message });
    }
};


export const getMuseos = async (req, res) => {
    try {
        const [result] = await queryDatabase("SELECT * from museos");
        if (result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron museos' });
        }
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener museos', error: error.message });
    }
};

export const getMuseo = async (req, res) => {
    const { museum_name } = req.body;
    if (!museum_name) {
        return res.status(400).json({ message: 'Nombre del museo no proporcionado' });
    }

    try {
        const [result] = await queryDatabase("SELECT * from museos WHERE museum_name = ?", [museum_name]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener el museo', error: error.message });
    }
};

export const putMuseos = async (req, res) => {
    const { id_museo, museum_name, museum_city, museum_loc, museum_desc, museum_hour, museum_img } = req.body;
    if (!id_museo || !museum_name || !museum_city || !museum_loc || !museum_hour || !museum_img) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [result] = await queryDatabase("UPDATE museos SET museum_name = ?, museum_city = ?, museum_loc = ?, museum_desc = ?, museum_hour = ?, museum_img = ? WHERE id_museo = ?",
            [museum_name, museum_city, museum_loc, museum_desc, museum_hour, museum_img, id_museo]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }
        res.status(200).json({ message: `Museo ${museum_name} actualizado correctamente` });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al actualizar el museo', error: error.message });
    }
};
