const express = require("express");
const app = express();
const cors = require("cors");
const path = require('path');
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("../../"));
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-es", "index.html"));
});

app.get("/consultoria", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-es", "consultoria.html"));
});

app.get("/contacto", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "html", "contacto.html"));
});

app.get("/cookies", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-es", "cookies.html"));
});

app.get("/legal", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-es", "legal.html"));
});

app.get("/nosotros", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-es", "nosotros.html"));
});

app.get("/osint", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-es", "osint.html"));
});

app.get("/pentesting", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-es", "pentesting.html"));
});

// Ingles hmtl

app.get("/en/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-en", "index.html"));
});

app.get("/consulting", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-en", "consultoria.html"));
});

app.get("/contact", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-en", "contacto.html"));
});

app.get("/cookies/en", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-en", "cookies.html"));
});

app.get("/legal/en", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-en", "legal.html"));
});

app.get("/us", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-en", "nosotros.html"));
});

app.get("/osint/en", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-en", "osint.html"));
});

app.get("/pentesting/en", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "..", "html-en", "pentesting.html"));
});

// Envio de consulta por gmail

const sendMail = require('./gmail');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const EMAIL_EMISOR = 'facu.granzotto5@gmail.com';
const EMAIL_RECEPTOR = 'facugranzotto05@gmail.com';

app.post('/enviar-email', async (req, res) => {
    try {
        const { nombre, email, celular, mensaje, servicio } = req.body;

        const options = {
            to: EMAIL_RECEPTOR,
            from: EMAIL_EMISOR,
            subject: servicio,
            text: `Nombre: ${nombre}\nEmail: ${email}\nCelular: ${celular}\nMensaje: ${mensaje}`,
            textEncoding: 'base64'
        };

        const messageId = await sendMail(options);
        console.log('Correo enviado');
        return messageId;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
