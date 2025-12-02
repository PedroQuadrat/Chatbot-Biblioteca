const axios = require('axios');

class CluService {
    constructor(apiKey, endpoint, projectName, deploymentName) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.projectName = projectName;
        this.deploymentName = deploymentName;
    }

    async analyzeText(query) {
        if (!query || query.trim() === '') {
            console.log(" CLU: Texto vazio recebido. Ignorando chamada.");
            return { topIntent: "None", entities: [] };
        }

        // Limpeza do Endpoint
        const cleanEndpoint = this.endpoint.replace(/\/$/, "");
        const url = `${cleanEndpoint}/language/:analyze-conversations?api-version=2022-10-01-preview`;

        const payload = {
            kind: "Conversation",
            analysisInput: {
                conversationItem: {
                    id: "1",
                    text: query,
                    modality: "text",
                    language: "pt", 
                    participantId: "1"
                }
            },
            parameters: {
                projectName: this.projectName,
                deploymentName: this.deploymentName,
                stringIndexType: "Utf16CodeUnit"
            }
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Ocp-Apim-Subscription-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            const prediction = response.data.result.prediction;
            return {
                topIntent: prediction.topIntent,
                entities: prediction.entities || []
            };

        } catch (error) {
            console.error(" ERRO CLU (400 - Bad Request):");
            if (error.response && error.response.data) {
                console.error("DETALHES DO AZURE:", JSON.stringify(error.response.data, null, 2));
            } else {
                console.error(error.message);
            }
            return { topIntent: "None", entities: [] };
        }
    }
}

module.exports.CluService = CluService;