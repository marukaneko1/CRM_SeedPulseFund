import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleIdeas = [
  {
    title: "AI-Powered Deal Analysis",
    description: "Implement machine learning algorithms to automatically analyze deal terms, market conditions, and historical data to provide investment recommendations and risk assessments.",
    category: "TECH",
    status: "IN_PROGRESS",
    priority: "HIGH",
    tags: "AI, machine learning, automation, deal analysis",
    color: "BLUE",
    positionX: 100,
    positionY: 50
  },
  {
    title: "Portfolio Company Dashboard",
    description: "Create a comprehensive dashboard for portfolio companies to track KPIs, financial metrics, and operational performance in real-time.",
    category: "PRODUCT",
    status: "NEW",
    priority: "MEDIUM",
    tags: "dashboard, portfolio, KPIs, real-time",
    color: "GREEN",
    positionX: 300,
    positionY: 100
  },
  {
    title: "Automated Due Diligence Workflow",
    description: "Streamline the due diligence process with automated document collection, analysis, and report generation to reduce manual work and improve efficiency.",
    category: "PROCESS",
    status: "REVIEW",
    priority: "HIGH",
    tags: "automation, due diligence, workflow, efficiency",
    color: "PURPLE",
    positionX: 500,
    positionY: 150
  },
  {
    title: "LP Communication Portal",
    description: "Build a secure portal for Limited Partners to access portfolio updates, financial reports, and communication tools to improve transparency and engagement.",
    category: "PRODUCT",
    status: "IMPLEMENTED",
    priority: "MEDIUM",
    tags: "LP portal, communication, transparency, reports",
    color: "YELLOW",
    positionX: 200,
    positionY: 300
  },
  {
    title: "ESG Impact Tracking",
    description: "Develop a system to track and measure Environmental, Social, and Governance (ESG) impact across portfolio companies to meet regulatory requirements and investor demands.",
    category: "PROCESS",
    status: "NEW",
    priority: "MEDIUM",
    tags: "ESG, sustainability, impact, compliance",
    color: "PINK",
    positionX: 400,
    positionY: 250
  },
  {
    title: "Mobile App for Deal Flow",
    description: "Create a mobile application that allows team members to capture deal information, upload documents, and collaborate on deals while on the go.",
    category: "TECH",
    status: "IN_PROGRESS",
    priority: "LOW",
    tags: "mobile, deal flow, collaboration, productivity",
    color: "ORANGE",
    positionX: 600,
    positionY: 200
  },
  {
    title: "Automated Market Research",
    description: "Implement AI-driven market research tools that automatically gather industry data, competitor analysis, and market trends to support investment decisions.",
    category: "TECH",
    status: "NEW",
    priority: "HIGH",
    tags: "AI, market research, automation, intelligence",
    color: "BLUE",
    positionX: 100,
    positionY: 400
  },
  {
    title: "Portfolio Company Mentorship Program",
    description: "Establish a structured mentorship program connecting portfolio company founders with industry experts and successful entrepreneurs for guidance and support.",
    category: "PROCESS",
    status: "REVIEW",
    priority: "MEDIUM",
    tags: "mentorship, networking, support, growth",
    color: "GREEN",
    positionX: 300,
    positionY: 450
  },
  {
    title: "Blockchain for Document Verification",
    description: "Explore using blockchain technology to create immutable records of investment documents, contracts, and compliance certificates for enhanced security and transparency.",
    category: "TECH",
    status: "NEW",
    priority: "LOW",
    tags: "blockchain, security, transparency, documents",
    color: "PURPLE",
    positionX: 500,
    positionY: 350
  },
  {
    title: "Sustainable Investment Framework",
    description: "Develop a comprehensive framework for evaluating and selecting sustainable investment opportunities that align with environmental and social impact goals.",
    category: "PROCESS",
    status: "IMPLEMENTED",
    priority: "HIGH",
    tags: "sustainability, framework, impact, ESG",
    color: "YELLOW",
    positionX: 700,
    positionY: 100
  }
]

async function seedIdeas() {
  try {
    console.log('🌱 Seeding ideas...')

    // Get the first user (admin) to assign as author
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('❌ No admin user found. Please create users first.')
      return
    }

    // Clear existing ideas
    await prisma.ideaVote.deleteMany()
    await prisma.ideaComment.deleteMany()
    await prisma.idea.deleteMany()

    // Create sample ideas
    for (const ideaData of sampleIdeas) {
      const idea = await prisma.idea.create({
        data: {
          ...ideaData,
          authorId: adminUser.id
        }
      })

      // Add some sample comments
      const commentCount = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < commentCount; i++) {
        await prisma.ideaComment.create({
          data: {
            content: [
              "Great idea! This could really improve our efficiency.",
              "I think we should prioritize this for Q1.",
              "This aligns well with our strategic goals.",
              "We need to consider the implementation timeline.",
              "Excellent suggestion! Let's discuss this in the next team meeting."
            ][Math.floor(Math.random() * 5)],
            ideaId: idea.id,
            authorId: adminUser.id
          }
        })
      }

      // Add one sample vote per idea
      await prisma.ideaVote.create({
        data: {
          ideaId: idea.id,
          userId: adminUser.id,
          type: Math.random() > 0.2 ? 'UP' : 'DOWN'
        }
      })

      console.log(`✅ Created idea: ${idea.title}`)
    }

    console.log(`🎉 Successfully seeded ${sampleIdeas.length} ideas!`)
    
  } catch (error) {
    console.error('❌ Error seeding ideas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedIdeas()
