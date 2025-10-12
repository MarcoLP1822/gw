import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding test data...');

    // Crea un utente di test se non esiste
    let user = await prisma.user.findFirst({
        where: { email: 'test@ghostwriter.com' }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'test@ghostwriter.com',
                name: 'Test User',
                role: 'ghost_writer'
            }
        });
        console.log('✅ User created:', user.email);
    } else {
        console.log('✅ User already exists:', user.email);
    }

    // Crea alcuni progetti di test
    const projectsData = [
        {
            authorName: 'Marco Rossi',
            authorRole: 'CEO',
            company: 'TechInnovate SRL',
            industry: 'Tecnologia',
            bookTitle: 'Il Futuro dell\'Innovazione Digitale',
            bookSubtitle: 'Come trasformare la tua azienda nell\'era digitale',
            targetReaders: 'Imprenditori e manager che vogliono digitalizzare la propria azienda',
            currentSituation: 'Marco ha costruito una startup tech di successo in 10 anni',
            challengeFaced: 'Affrontare la competizione globale e scalare l\'azienda',
            transformation: 'Implementazione di AI e automazione nei processi',
            achievement: 'Crescita del 300% in 3 anni e espansione internazionale',
            lessonLearned: 'L\'innovazione continua è la chiave del successo',
            businessGoals: 'Posizionarsi come thought leader nel settore tech',
            uniqueValue: 'Esperienza pratica nella trasformazione digitale',
            estimatedPages: 250,
            status: 'completed'
        },
        {
            authorName: 'Laura Bianchi',
            authorRole: 'Leadership Coach',
            company: 'Executive Coaching Italia',
            industry: 'Coaching e Formazione',
            bookTitle: 'Leadership Autentica',
            bookSubtitle: 'Guida pratica per leader moderni',
            targetReaders: 'Manager e leader aziendali che vogliono migliorare le loro competenze',
            currentSituation: 'Laura ha 15 anni di esperienza nel coaching',
            challengeFaced: 'Aiutare i leader a trovare il proprio stile autentico',
            transformation: 'Sviluppo di un metodo proprietario di coaching',
            achievement: 'Oltre 500 leader formati con successo',
            lessonLearned: 'L\'autenticità è la base della vera leadership',
            businessGoals: 'Espandere il business del coaching online',
            uniqueValue: 'Metodo unico basato su psicologia e neuroscienze',
            estimatedPages: 200,
            status: 'generating_chapters'
        },
        {
            authorName: 'Giovanni Verdi',
            authorRole: 'Founder',
            company: 'GreenTech Solutions',
            industry: 'Sostenibilità',
            bookTitle: 'Business Sostenibile',
            bookSubtitle: 'Profitto e pianeta possono coesistere',
            targetReaders: 'Imprenditori interessati alla sostenibilità ambientale',
            currentSituation: 'Giovanni ha fondato 3 startup nel settore green',
            challengeFaced: 'Bilanciare profitto e impatto ambientale',
            transformation: 'Creazione di un modello di business sostenibile',
            achievement: 'Carbon neutral e crescita del 200%',
            lessonLearned: 'La sostenibilità è un vantaggio competitivo',
            businessGoals: 'Ispirare altri imprenditori al cambiamento',
            uniqueValue: 'Case study reali di business sostenibile',
            estimatedPages: 180,
            status: 'generating_outline'
        },
        {
            authorName: 'Sofia Neri',
            authorRole: 'CMO',
            company: 'Digital Marketing Pro',
            industry: 'Marketing',
            bookTitle: 'Marketing nell\'Era AI',
            bookSubtitle: 'Come l\'intelligenza artificiale sta cambiando il marketing',
            targetReaders: 'Marketer e imprenditori digitali',
            currentSituation: 'Sofia ha guidato campagne per brand Fortune 500',
            challengeFaced: 'Adattarsi rapidamente ai cambiamenti tecnologici',
            transformation: 'Integrazione AI nelle strategie di marketing',
            achievement: 'ROI medio del 400% sulle campagne',
            lessonLearned: 'L\'AI è un amplificatore, non un sostituto della creatività',
            businessGoals: 'Diventare riferimento nel marketing AI',
            uniqueValue: 'Strategie pratiche testate su grandi brand',
            estimatedPages: 220,
            status: 'draft'
        }
    ];

    for (const projectData of projectsData) {
        const existingProject = await prisma.project.findFirst({
            where: {
                bookTitle: projectData.bookTitle,
                userId: user.id
            }
        });

        if (!existingProject) {
            const project = await prisma.project.create({
                data: {
                    ...projectData,
                    userId: user.id
                }
            });

            console.log(`✅ Project created: ${project.bookTitle}`);

            // Aggiungi capitoli per i progetti completati o in generazione
            if (projectData.status === 'completed') {
                const chaptersCount = Math.floor(Math.random() * 5) + 8; // 8-12 capitoli

                for (let i = 1; i <= chaptersCount; i++) {
                    await prisma.chapter.create({
                        data: {
                            projectId: project.id,
                            chapterNumber: i,
                            title: `Capitolo ${i}: Titolo di esempio`,
                            content: `Contenuto del capitolo ${i}. `.repeat(100),
                            wordCount: Math.floor(Math.random() * 1000) + 1500, // 1500-2500 parole
                            status: 'completed',
                            aiModel: 'gpt-4o-mini',
                            generatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Ultimi 30 giorni
                        }
                    });
                }

                // Aggiungi log di generazione
                await prisma.generationLog.create({
                    data: {
                        projectId: project.id,
                        step: 'outline',
                        aiModel: 'gpt-4o-mini',
                        promptTokens: 2000,
                        completionTokens: 1500,
                        totalTokens: 3500,
                        cost: 0.05,
                        duration: 5000,
                        success: true
                    }
                });

                for (let i = 1; i <= chaptersCount; i++) {
                    await prisma.generationLog.create({
                        data: {
                            projectId: project.id,
                            step: `chapter_${i}`,
                            aiModel: 'gpt-4o-mini',
                            promptTokens: 3000,
                            completionTokens: 2500,
                            totalTokens: 5500,
                            cost: 0.08,
                            duration: 8000,
                            success: true,
                            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                        }
                    });
                }
            } else if (projectData.status === 'generating_chapters') {
                // Crea alcuni capitoli
                const chaptersCount = Math.floor(Math.random() * 3) + 3; // 3-5 capitoli

                for (let i = 1; i <= chaptersCount; i++) {
                    await prisma.chapter.create({
                        data: {
                            projectId: project.id,
                            chapterNumber: i,
                            title: `Capitolo ${i}: In corso`,
                            content: `Contenuto parziale del capitolo ${i}. `.repeat(50),
                            wordCount: Math.floor(Math.random() * 500) + 1000,
                            status: 'completed',
                            aiModel: 'gpt-4o-mini',
                            generatedAt: new Date()
                        }
                    });
                }
            }
        } else {
            console.log(`⏭️  Project already exists: ${projectData.bookTitle}`);
        }
    }

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
