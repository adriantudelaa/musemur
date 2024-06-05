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

export const getAllExposiciones = async (req, res) => {
    try {
        const [result] = await queryDatabase("SELECT * FROM exposiciones");
        if (result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron exposiciones' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las exposiciones', error: error.message });
    }
};

export const getExposicionesByMuseum = async (req, res) => {
    const { museum_name } = req.body;
    if (!museum_name) {
        return res.status(400).json({ message: 'Nombre del museo no proporcionado' });
    }

    try {
        const [museoResult] = await queryDatabase("SELECT id_museo FROM museos WHERE museum_name = ?", [museum_name]);
        if (museoResult.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        const id_museo = museoResult[0].id_museo;
        const [result] = await queryDatabase("SELECT * FROM exposiciones WHERE id_museo = ?", [id_museo]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron exposiciones para el museo especificado' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las exposiciones', error: error.message });
    }
};

export const addExposicion = async (req, res) => {
    const { museum_name, expo_title, expo_desc } = req.body;
    if (!museum_name || !expo_title || !expo_desc) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [museoResult] = await queryDatabase("SELECT id_museo FROM museos WHERE museum_name = ?", [museum_name]);
        if (museoResult.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        const id_museo = museoResult[0].id_museo;
        const [result] = await queryDatabase(
            "INSERT INTO exposiciones (id_museo, expo_title, expo_desc) VALUES (?, ?, ?)",
            [id_museo, expo_title, expo_desc]
        );

        res.status(201).json({ message: 'Exposición añadida correctamente', id_expo: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error al añadir la exposición', error: error.message });
    }
};

export const editExposicion = async (req, res) => {
    const { id_expo, museum_name, expo_title, expo_desc } = req.body;
    if (!id_expo || !museum_name || !expo_title || !expo_desc) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [museoResult] = await queryDatabase("SELECT id_museo FROM museos WHERE museum_name = ?", [museum_name]);
        if (museoResult.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        const id_museo = museoResult[0].id_museo;
        const [result] = await queryDatabase(
            "UPDATE exposiciones SET expo_title = ?, expo_desc = ? WHERE id_expo = ? AND id_museo = ?",
            [expo_title, expo_desc, id_expo, id_museo]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exposición no encontrada' });
        }

        res.status(200).json({ message: 'Exposición actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la exposición', error: error.message });
    }
};

export const deleteExposicion = async (req, res) => {
    const { id_expo, museum_name } = req.body;
    if (!id_expo || !museum_name) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [museoResult] = await queryDatabase("SELECT id_museo FROM museos WHERE museum_name = ?", [museum_name]);
        if (museoResult.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        const id_museo = museoResult[0].id_museo;
        const [result] = await queryDatabase(
            "DELETE FROM exposiciones WHERE id_expo = ? AND id_museo = ?",
            [id_expo, id_museo]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exposición no encontrada' });
        }

        res.status(200).json({ message: 'Exposición eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la exposición', error: error.message });
    }
};
