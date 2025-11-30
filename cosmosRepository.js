const { CosmosClient } = require('@azure/cosmos');

class CosmosRepository {
    constructor(endpoint, key, databaseId, containerId) {
        this.client = new CosmosClient({ endpoint, key });
        this.databaseId = databaseId;
        this.containerId = containerId;
        this.container = null;
    }

    async init() {
        if (!this.container) {
            const { database } = await this.client.databases.createIfNotExists({ id: this.databaseId });
            const { container } = await database.containers.createIfNotExists({ id: this.containerId });
            this.container = container;
        }
    }

    async findActiveLoan(alunoId, livroNome) {
        await this.init();

        const querySpec = {
            query: `
                SELECT * FROM c 
                WHERE c.alunoId = @alunoId 
                AND c.status = 'ativo' 
                AND CONTAINS(LOWER(c.livro), LOWER(@livro))
            `,
            parameters: [
                { name: "@alunoId", value: alunoId },
                { name: "@livro", value: livroNome }
            ]
        };

        const { resources: results } = await this.container.items.query(querySpec).fetchAll();
        return results.length > 0 ? results[0] : null;
    }

    async updateLoanDate(docId, alunoId, novaData) {
        await this.init();
        
        const { resource: item } = await this.container.item(docId, alunoId).read();
        
        if (item) {
            item.dataDevolucao = novaData;
            
            const { resource: updated } = await this.container.item(docId, alunoId).replace(item);
            return updated;
        }
        return null;
    }
}

module.exports.CosmosRepository = CosmosRepository;