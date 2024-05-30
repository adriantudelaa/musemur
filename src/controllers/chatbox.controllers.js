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

export const getChatboxQues = async (req, res) => {
    try {
        const [result] = await queryDatabase("SELECT cb_que from chatbox;");
        if (result.length === 0) {
            return res.status(404).json({ message: 'No se encontraron preguntas en el chatbox' });
        }
        res.json(result);
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener preguntas del chatbox', error: error.message });
    }
};

export const getChatboxByQues = async (req, res) => {
    const { id_que } = req.body;
    if (!id_que) {
        return res.status(400).json({ message: 'ID de pregunta no proporcionado' });
    }

    try {
        const [question] = await queryDatabase("SELECT * from chatbox where id_que = ?;", [id_que]);
        if (question.length === 0) {
            return res.status(404).json({ message: 'Pregunta no encontrada' });
        }
        const result = question[0];
        return res.status(200).json({ message: result.cb_res });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener la pregunta del chatbox', error: error.message });
    }
};

export const getChatboxByMuseum = async (req, res) => {
    const { id_museo } = req.body;
    if (!id_museo) {
        return res.status(400).json({ message: 'ID del museo no proporcionado' });
    }

    try {
        const [question] = await queryDatabase("SELECT cb_que from chatbox where id_museo = ?;", [id_museo]);
        if (question.length === 0) {
            return res.status(404).json({ message: 'Preguntas no encontradas para el museo especificado' });
        }
        const result = question[0];
        return res.status(200).json({ message: result.cb_res });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al obtener las preguntas del chatbox por museo', error: error.message });
    }
};

export const postChatbox = async (req, res) => {
    const { cb_que, cb_res, reserva_museum } = req.body;
    if (!cb_que || !cb_res || !reserva_museum) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        await queryDatabase("INSERT INTO chatbox (cb_que, cb_res, reserva_museum) VALUES (?, ?, ?)",
            [cb_que, cb_res, reserva_museum]);
        res.status(201).json({
            message: `Pregunta insertada correctamente\nPregunta: ${cb_que}\nRespuesta: ${cb_res}\nMuseo: ${reserva_museum}`
        });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al insertar la pregunta en el chatbox', error: error.message });
    }
};

export const putChatbox = async (req, res) => {
    const { cb_que, cb_res, id_museo, id_que } = req.body;
    if (!cb_que || !cb_res || !id_museo || !id_que) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        const [rows] = await queryDatabase("UPDATE chatbox SET cb_que = ?, cb_res = ?, id_museo = ? WHERE id_que = ?",
            [cb_que, cb_res, id_museo, id_que]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Pregunta no encontrada' });
        }
        res.status(200).json({ message: 'Pregunta actualizada correctamente' });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al actualizar la pregunta en el chatbox', error: error.message });
    }
};

export const deleteChatbox = async (req, res) => {
    const { id_que } = req.body;
    if (!id_que) {
        return res.status(400).json({ message: 'ID de pregunta no proporcionado' });
    }

    try {
        const [rows] = await queryDatabase("DELETE FROM chatbox WHERE id_que = ?", [id_que]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: 'Pregunta no encontrada' });
        }
        res.status(200).json({ message: 'Pregunta eliminada correctamente' });
    } catch (error) {
        if (error.message === 'Database connection was refused' || error.message === 'Database connection was lost') {
            return res.status(503).json({ message: 'Servicio no disponible. Inténtelo de nuevo más tarde.' });
        }
        res.status(500).json({ message: 'Error al eliminar la pregunta del chatbox', error: error.message });
    }
};
