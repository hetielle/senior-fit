import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

const workouts = [
  {
    dayType: "upper",
    title: "Membros Superiores",
    exercises: [
      {
        name: "Flexão de Braço Modificada",
        description: "Apoie os joelhos no chão e desça o peito até quase tocá-lo.",
        muscleGroup: "Peitoral",
        sets: 3,
        reps: 8,
      },
      {
        name: "Rosca Direta com Halteres",
        description: "Com os cotovelos fixos ao lado do corpo, suba os halteres até os ombros.",
        muscleGroup: "Bíceps",
        sets: 3,
        reps: 10,
      },
      {
        name: "Tríceps no Banco",
        description: "Apoie as mãos numa cadeira atrás de você e dobre os cotovelos.",
        muscleGroup: "Tríceps",
        sets: 3,
        reps: 8,
      },
      {
        name: "Elevação Lateral",
        description: "Com halteres leves, eleve os braços lateralmente até a altura dos ombros.",
        muscleGroup: "Ombros",
        sets: 3,
        reps: 10,
      },
    ],
  },
  {
    dayType: "lower",
    title: "Membros Inferiores",
    exercises: [
      {
        name: "Agachamento na Cadeira",
        description: "Em pé na frente de uma cadeira, desça como se fosse sentar e volte.",
        muscleGroup: "Quadríceps",
        sets: 3,
        reps: 10,
      },
      {
        name: "Elevação de Panturrilha",
        description: "Apoie-se numa parede ou cadeira e suba na ponta dos pés lentamente.",
        muscleGroup: "Panturrilha",
        sets: 3,
        reps: 15,
      },
      {
        name: "Extensão de Quadril",
        description: "Apoiado numa cadeira, estenda uma perna para trás contraindo o glúteo.",
        muscleGroup: "Glúteos",
        sets: 3,
        reps: 10,
      },
      {
        name: "Marcha Estacionária",
        description: "Levante os joelhos alternadamente como se estivesse caminhando no lugar.",
        muscleGroup: "Quadríceps",
        sets: 1,
        durationSecs: 60,
      },
    ],
  },
  {
    dayType: "core",
    title: "Core e Abdômen",
    exercises: [
      {
        name: "Prancha Modificada",
        description: "Apoie os antebraços e joelhos no chão, mantendo o corpo alinhado.",
        muscleGroup: "Abdômen",
        sets: 3,
        durationSecs: 20,
      },
      {
        name: "Ponte Glútea",
        description: "Deitado, com joelhos dobrados, eleve o quadril contraindo o glúteo.",
        muscleGroup: "Glúteos e Core",
        sets: 3,
        reps: 12,
      },
      {
        name: "Crunch Abdominal",
        description: "Deitado, eleve os ombros do chão contraindo o abdômen.",
        muscleGroup: "Abdômen",
        sets: 3,
        reps: 10,
      },
      {
        name: "Rotação de Tronco",
        description: "Sentado numa cadeira, gire o tronco para cada lado com controle.",
        muscleGroup: "Oblíquos",
        sets: 2,
        reps: 10,
      },
    ],
  },
  {
    dayType: "full",
    title: "Corpo Todo",
    exercises: [
      {
        name: "Polichinelo Modificado",
        description: "Faça o movimento de polichinelo sem pular, dando passos laterais.",
        muscleGroup: "Corpo Todo",
        sets: 3,
        reps: 15,
      },
      {
        name: "Agachamento com Rosca",
        description: "Combine o agachamento com a rosca direta para trabalhar mais grupos musculares.",
        muscleGroup: "Corpo Todo",
        sets: 3,
        reps: 8,
      },
      {
        name: "Remada Curvada",
        description: "Inclinado para frente com halteres, puxe os cotovelos para trás.",
        muscleGroup: "Costas",
        sets: 3,
        reps: 10,
      },
      {
        name: "Step Touch",
        description: "Dê um passo lateral e toque os pés alternando os lados de forma rítmica.",
        muscleGroup: "Cardio",
        sets: 3,
        durationSecs: 30,
      },
    ],
  },
  {
    dayType: "stretch",
    title: "Alongamento e Flexibilidade",
    exercises: [
      {
        name: "Alongamento de Pescoço",
        description: "Incline a cabeça para cada lado e para frente, mantendo a posição.",
        muscleGroup: "Pescoço",
        sets: 1,
        durationSecs: 30,
      },
      {
        name: "Alongamento de Ombros",
        description: "Puxe um braço estendido na frente do peito e segure.",
        muscleGroup: "Ombros",
        sets: 1,
        durationSecs: 30,
      },
      {
        name: "Alongamento de Quadríceps",
        description: "Em pé, segure o tornozelo atrás do corpo e mantenha o equilíbrio.",
        muscleGroup: "Quadríceps",
        sets: 1,
        durationSecs: 45,
      },
      {
        name: "Alongamento de Isquiotibiais",
        description: "Sentado, estenda uma perna e alcance os dedos do pé com as mãos.",
        muscleGroup: "Isquiotibiais",
        sets: 1,
        durationSecs: 45,
      },
      {
        name: "Rotação de Tornozelo",
        description: "Sentado, faça círculos com cada pé no sentido horário e anti-horário.",
        muscleGroup: "Tornozelos",
        sets: 1,
        durationSecs: 30,
      },
    ],
  },
];

async function main() {
  console.log("Seeding workouts...");

  for (const w of workouts) {
    const createdExercises = await Promise.all(
      w.exercises.map((e) =>
        db.exercise.upsert({
          where: { id: `${w.dayType}-${e.name.toLowerCase().replace(/\s+/g, "-")}` },
          update: e,
          create: {
            id: `${w.dayType}-${e.name.toLowerCase().replace(/\s+/g, "-")}`,
            ...e,
          },
        }),
      ),
    );

    await db.workout.upsert({
      where: { dayType: w.dayType },
      update: { title: w.title },
      create: {
        dayType: w.dayType,
        title: w.title,
        items: {
          create: createdExercises.map((exercise, index) => ({
            exerciseId: exercise.id,
            order: index + 1,
            sets: exercise.sets,
            reps: exercise.reps,
            durationSecs: exercise.durationSecs,
          })),
        },
      },
    });

    console.log(`  ✓ ${w.title}`);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
