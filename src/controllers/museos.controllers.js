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

export const getMuseos = async (req, res) => {
    try {
        const [result] = await queryDatabase("SELECT * FROM museos");
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

export const getMuseosCity = async (req, res) => {
    const { museum_city } = req.body;
    if (!museum_city) {
        return res.status(400).json({ message: 'Ciudad del museo no proporcionada' });
    }

    try {
        const [result] = await queryDatabase("SELECT * FROM museos WHERE museum_city = ?", [museum_city]);
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

export const getMuseo = async (req, res) => {
    const { museum_name } = req.body;
    if (!museum_name) {
        return res.status(400).json({ message: 'Nombre del museo no proporcionado' });
    }

    try {
        const [result] = await queryDatabase("SELECT * FROM museos WHERE museum_name = ?", [museum_name]);
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
    const { museum_name, museum_city, museum_loc, museum_desc, museum_hour, exhibitions } = req.body;
    if (!museum_name || !museum_city || !museum_loc || !museum_hour) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [museoResult] = await queryDatabase("SELECT id_museo FROM museos WHERE museum_name = ?", [museum_name]);
        
        if (museoResult.length === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        const id_museo = museoResult[0].id_museo;

        const [result] = await queryDatabase(
            "UPDATE museos SET museum_name = ?, museum_city = ?, museum_loc = ?, museum_desc = ?, museum_hour = ? WHERE id_museo = ?",
            [museum_name, museum_city, museum_loc, museum_desc, museum_hour, id_museo]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        if (exhibitions) {
            await queryDatabase("DELETE FROM exposiciones WHERE id_museo = ?", [id_museo]);
            for (const expo of exhibitions) {
                await queryDatabase(
                    "INSERT INTO exposiciones (id_museo, expo_title, expo_desc, expo_image) VALUES (?, ?, ?, ?)",
                    [id_museo, expo.title, expo.description, expo.image]
                );
            }
        }

        res.status(200).json({ message: `Museo ${museum_name} actualizado correctamente` });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al actualizar el museo', error: error.message });
    }
};

export const deleteMuseo = async (req, res) => {
    const { museum_name } = req.body;

    if (!museum_name) {
        return res.status(400).json({ message: 'Se requiere nombre del museo' });
    }

    try {
        await queryDatabase('SET SQL_SAFE_UPDATES = 0');
        
        await queryDatabase(`
            DELETE admin FROM admin
            JOIN museos ON admin.id_museo = museos.id_museo
            WHERE museos.museum_name = ?
        `, [museum_name]);

        await queryDatabase(`
            DELETE chatbox FROM chatbox
            JOIN museos ON chatbox.id_museo = museos.id_museo
            WHERE museos.museum_name = ?
        `, [museum_name]);

        const [rows] = await queryDatabase(`
            DELETE FROM museos WHERE museum_name = ?
        `, [museum_name]);

        await queryDatabase('SET SQL_SAFE_UPDATES = 1');

        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Museo no encontrado' });
        }

        res.status(200).json({
            message: 'Museo con nombre ' + museum_name + ' eliminado'
        });
    } catch (error) {
        console.error('Error al eliminar museo:', error);
        await queryDatabase('SET SQL_SAFE_UPDATES = 1');
        res.status(500).json({ message: 'Error al eliminar museo' });
    }
};

export const addMuseo = async (req, res) => {
    const { museum_name, museum_city, museum_loc, museum_desc, museum_hour, exhibitions } = req.body;
    if (!museum_name || !museum_city || !museum_loc || !museum_desc || !museum_hour) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [result] = await queryDatabase(
            "INSERT INTO museos (museum_name, museum_city, museum_loc, museum_desc, museum_hour) VALUES (?, ?, ?, ?, ?)",
            [museum_name, museum_city, museum_loc, museum_desc, museum_hour]
        );

        const id_museo = result.insertId;

        if (exhibitions && exhibitions.length > 0) {
            for (const expo of exhibitions) {
                await queryDatabase(
                    "INSERT INTO exposiciones (id_museo, expo_title, expo_desc) VALUES (?, ?, ?)",
                    [id_museo, expo.title, expo.description]
                );
            }
        }

        res.status(201).json({ message: 'Museo añadido correctamente', id_museo });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al añadir el museo', error: error.message });
    }
};

export const getExhibitions = async (req, res) => {
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
            return res.status(404).json({ message: 'No se encontraron exposiciones' });
        }
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener las exposiciones', error: error.message });
    }
};
