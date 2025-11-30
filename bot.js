const { ActivityHandler, MessageFactory } = require('botbuilder');

class LibraryBot extends ActivityHandler {
    constructor(cluService, cosmosRepository) {
        super();
        this.cluService = cluService;
        this.cosmosRepository = cosmosRepository;

        this.onMessage(async (context, next) => {
            const userText = context.activity.text;
            console.log('Mensagem recebida:', userText);

            const cluResult = await this.cluService.analyzeText(userText);
            const topIntent = cluResult.topIntent;
            const entities = cluResult.entities;

            console.log(`Intenção Identificada: ${topIntent}`);

            switch (topIntent) {
                case 'consultar_horario':
                    await this.handleConsultarHorario(context);
                    break;

                case 'renovar_emprestimo':
                    await this.handleRenovarEmprestimo(context, entities);
                    break;

                case 'reservar_livro':
                    await this.handleReservarLivro(context, entities);
                    break;

                default:
                    await context.sendActivity('Desculpa, não percebi. Sou o assistente da biblioteca. Podes perguntar sobre horários, renovações ou reservas.');
                    break;
            }

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Olá! Bem-vindo à Biblioteca Universitária. Em que posso ser útil hoje?');
                }
            }
            await next();
        });
    }

    // --- Métodos Auxiliares (Handlers) ---

    async handleConsultarHorario(context) {
        await context.sendActivity('A biblioteca está aberta de Segunda a Sexta, das 08:00 às 22:00, e aos Sábados, das 09:00 às 13:00.');
    }

    async handleRenovarEmprestimo(context, entities) {
        const livroEntity = entities.find(e => e.category === 'Livro'); 
        
        // Simulação de ID de aluno
        const alunoId = "aluno_teste_01"; 

        if (!livroEntity) {
            await context.sendActivity("Qual o livro que gostarias de renovar? Por favor, indica o nome completo.");
            return;
        }

        const livroNome = livroEntity.text;
        
        const emprestimo = await this.cosmosRepository.findActiveLoan(alunoId, livroNome);

        if (emprestimo) {
            const novaData = new Date();
            novaData.setDate(novaData.getDate() + 7); 
            
            await this.cosmosRepository.updateLoanDate(emprestimo.id, alunoId, novaData);
            await context.sendActivity(`Sucesso! O livro "${livroNome}" foi renovado até ${novaData.toLocaleDateString('pt-PT')}.`);
        } else {
            await context.sendActivity(`Não encontrei nenhum empréstimo ativo para o livro "${livroNome}" na sua conta.`);
        }
    }

    async handleReservarLivro(context, entities) {
        const livroEntity = entities.find(e => e.category === 'Livro');
        
        if (livroEntity) {
            await context.sendActivity(`Recebi o teu pedido de reserva para "${livroEntity.text}". Vou verificar a disponibilidade e notificar-te em breve.`);
        } else {
            await context.sendActivity("Por favor, diz-me o nome do livro que desejas reservar.");
        }
    }
}

module.exports.LibraryBot = LibraryBot;