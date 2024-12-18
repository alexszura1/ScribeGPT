const express = require('express');
const axios = require('axios');
require('dotenv').config({ path: './api.env' });
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); // Middleware to parse JSON

app.post('/generate', async (req, res) => {
    const { transcription } = req.body;

    if (!transcription) {
        return res.status(400).json({ error: "No transcription provided" });
    }

    try {
        // Updated request to OpenAI API with chat/completions endpoint and customized instructions
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', // Use gpt-3.5-turbo or gpt-4
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a medical scribe who creates detailed and accurate office notes based on transcriptions. You should follow a structured format including HPI, Physical exam, X-ray (if applicable), Diagnosis, and Plan. Keep the note concise but comprehensive. Always ensure medical terminology is used correctly. The format should be HPI:,  Physical Exam (Body part), Diagnostics (xray/MRI), Plan ' 
                },
                { role: 'user', content: transcription }
            ],
            max_tokens: 300,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Extract the generated text from the response
        const generatedText = response.data.choices[0].message.content.trim();
        res.json({ generatedText });
    } catch (error) {
        console.error("Error from OpenAI:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate notes" });
    }
});

// Catch-all route for other requests (return index.html for any other path)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});