require('dotenv').config();
const express = require('express');
const cors = require('cors');
const common = require('oci-common');
const aiLanguage = require('oci-ailanguage');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configuración de autenticación usando variables de entorno (.env)
const privateKey = process.env.OCI_PRIVATE_KEY ? process.env.OCI_PRIVATE_KEY.replace(/\\n/g, '\n') : '';

const provider = new common.SimpleAuthenticationDetailsProvider(
    process.env.OCI_TENANCY,
    process.env.OCI_USER,
    process.env.OCI_FINGERPRINT,
    privateKey,
    null,
    common.Region.fromRegionId(process.env.OCI_REGION)
);

const client = new aiLanguage.AIServiceLanguageClient({ authenticationDetailsProvider: provider });

// 2. Definición de los Endpoints

// Endpoint 1: Analizar Sentimientos
app.post('/api/sentimientos', async (req, res) => {
    try {
        const request = { detectLanguageSentimentsDetails: { text: req.body.texto } };
        const response = await client.detectLanguageSentiments(request);
        res.json(response.detectLanguageSentimentsResult);
    } catch (error) {
        console.error("Error en Sentimientos:", error);
        res.status(500).json({ error: 'Error al procesar sentimientos' });
    }
});

// Endpoint 2: Detectar Idioma Dominante
app.post('/api/idioma', async (req, res) => {
    try {
        const request = { detectDominantLanguageDetails: { text: req.body.texto } };
        const response = await client.detectDominantLanguage(request);
        res.json(response.detectDominantLanguageResult);
    } catch (error) {
        console.error("Error en Idioma:", error);
        res.status(500).json({ error: 'Error al detectar el idioma' });
    }
});

// Endpoint 3: Detectar Entidades (Nombres, Lugares, Fechas, etc.)
app.post('/api/entidades', async (req, res) => {
    try {
        const request = { detectLanguageEntitiesDetails: { text: req.body.texto } };
        const response = await client.detectLanguageEntities(request);
        res.json(response.detectLanguageEntitiesResult);
    } catch (error) {
        console.error("Error en Entidades:", error);
        res.status(500).json({ error: 'Error al detectar entidades' });
    }
});

// Endpoint 4: Extraer Frases Clave
app.post('/api/frases-clave', async (req, res) => {
    try {
        const request = { detectLanguageKeyPhrasesDetails: { text: req.body.texto } };
        const response = await client.detectLanguageKeyPhrases(request);
        res.json(response.detectLanguageKeyPhrasesResult);
    } catch (error) {
        console.error("Error en Frases Clave:", error);
        res.status(500).json({ error: 'Error al extraer frases clave' });
    }
});

// Endpoint 5: Traducción de Texto 
app.post('/api/traduccion', async (req, res) => {
    try {
        const { texto, idiomaDestino } = req.body;

        const request = {
            batchLanguageTranslationDetails: {
                compartmentId: process.env.OCI_TENANCY, 
                targetLanguageCode: idiomaDestino || "en", 
                documents: [
                    {
                        key: "doc_1", 
                        text: texto,
                        languageCode: "auto" // El parámetro es obligatorio y activa la auto-detección
                    }
                ]
            }
        };

        const response = await client.batchLanguageTranslation(request);
        res.json(response.batchLanguageTranslationResult);
    } catch (error) {
        console.error("Error exacto en Traducción:", error.message || error);
        res.status(500).json({ error: 'Fallo en la comunicación con OCI para traducir.' });
    }
});

// 3. Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Endpoints disponibles:');
    console.log('- POST /api/sentimientos');
    console.log('- POST /api/idioma');
    console.log('- POST /api/entidades');
    console.log('- POST /api/frases-clave');
    console.log('- POST /api/traduccion  <-- ¡Nuevo!');
});