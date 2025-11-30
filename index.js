const restify = require('restify');
const path = require('path');

const { 
    CloudAdapter, 
    ConfigurationBotFrameworkAuthentication 
} = require('botbuilder');

const { LibraryBot } = require('./bot');
const { CluService } = require('./cluService');
const { CosmosRepository } = require('./cosmosRepository');

require('dotenv').config();

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} a ouvir em ${server.url}`);
    console.log('\nPara testar localmente, usa o Bot Framework Emulator.');
});


const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env);

const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] erro não tratado: ${error}`);
    await context.sendActivity('Ups, ocorreu um erro inesperado no sistema da biblioteca.');
};

const cluService = new CluService(
    process.env.CluAPIKey,
    process.env.CluAPIHost,
    process.env.CluProjectName,
    process.env.CluDeploymentName
);

const cosmosRepository = new CosmosRepository(
    process.env.CosmosEndpoint,
    process.env.CosmosKey,
    process.env.CosmosDatabaseId,
    process.env.CosmosContainerId
);

const myBot = new LibraryBot(cluService, cosmosRepository);

server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (context) => myBot.run(context));
});