const axios = require('axios');

class CluService {
    constructor(apiKey, endpoint, projectName, deploymentName) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
        this.projectName = projectName;
        this.deploymentName = deploymentName;
    }

    async analyzeText(query) {
        const url = `${this.endpoint}/language/:analyze-conversations?api-version=2022-10-01-preview`;

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
            console.error("Erro ao chamar o CLU:", error.message);
            return { topIntent: "None", entities: [] };
        }
    }
}

module.exports.CluService = CluService;