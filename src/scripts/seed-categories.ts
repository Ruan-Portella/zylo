import { db } from "@/db"
import { categories } from "@/db/schema"

const categoryNames = [
  "Carros e Veículos",
  "Comédia",
  "Educação",
  "Jogos",
  "Entretenimento",
  "Filmes e Animação",
  "Guias e Estilo",
  "Música",
  "Notícias e Política",
  "Pessoas e Blogs",
  "Pets e Animais",
  "Ciência e Tecnologia",
  "Esportes",
  "Viagens e Eventos"
]

async function main() {
  console.log('Seeding categories...')

  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `Vídeos sobre ${name.toLowerCase()}`
    }))

    await db.insert(categories).values(values)

    console.log('Categories seeded successfully!')
    process.exit(0)
  } catch (e) {
    console.log('Error seeding categories:', e)
    process.exit(1)
  }
}

main()