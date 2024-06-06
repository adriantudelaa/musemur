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

export const addExhibition = async (req, res) => {
    const { id_museo, expo_title, expo_desc } = req.body;
    if (!id_museo || !expo_title || !expo_desc) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [result] = await queryDatabase(
            "INSERT INTO exposiciones (id_museo, expo_title, expo_desc) VALUES (?, ?, ?)",
            [id_museo, expo_title, expo_desc]
        );

        res.status(201).json({ message: 'Exposición añadida correctamente', id_expo: result.insertId });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al añadir la exposición', error: error.message });
    }
};

export const getExhibitionsByMuseum = async (req, res) => {
    const { id_museo } = req.params;

    if (!id_museo) {
        return res.status(400).json({ message: 'ID del museo no proporcionado' });
    }

    try {
        const [result] = await queryDatabase(
            "SELECT * FROM exposiciones WHERE id_museo = ?",
            [id_museo]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron exposiciones para este museo' });
        }

        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener las exposiciones', error: error.message });
    }
};

export const updateExhibition = async (req, res) => {
    const { id_expo, expo_title, expo_desc } = req.body;
    if (!id_expo || !expo_title || !expo_desc) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [result] = await queryDatabase(
            "UPDATE exposiciones SET expo_title = ?, expo_desc = ? WHERE id_expo = ?",
            [expo_title, expo_desc, id_expo]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exposición no encontrada' });
        }

        res.status(200).json({ message: 'Exposición actualizada correctamente' });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al actualizar la exposición', error: error.message });
    }
};

export const deleteExhibitionsByMuseum = async (req, res) => {
    const { id_museo } = req.params;

    if (!id_museo) {
        return res.status(400).json({ message: 'ID del museo no proporcionado' });
    }

    try {
        await queryDatabase(
            "DELETE FROM exposiciones WHERE id_museo = ?",
            [id_museo]
        );

        res.status(200).json({ message: 'Exposiciones eliminadas correctamente' });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al eliminar las exposiciones', error: error.message });
    }
};

export const deleteExhibition = async (req, res) => {
    const { id_expo } = req.params;

    if (!id_expo) {
        return res.status(400).json({ message: 'ID de la exposición no proporcionado' });
    }

    try {
        const [result] = await queryDatabase(
            "DELETE FROM exposiciones WHERE id_expo = ?",
            [id_expo]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exposición no encontrada' });
        }

        res.status(200).json({ message: 'Exposición eliminada correctamente' });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al eliminar la exposición', error: error.message });
    }
};
