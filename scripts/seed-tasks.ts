import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleTasks = [
  {
    title: "Complete due diligence on TechCorp",
    description: "Review financial statements, market analysis, and competitive landscape for TechCorp investment opportunity.",
    status: "in_progress",
    priority: "high",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdBy: "admin",
    dealId: null,
    assignedTo: null
  },
  {
    title: "Schedule partner meeting for Q1 review",
    description: "Coordinate with all partners to schedule quarterly review meeting and prepare presentation materials.",
    status: "pending",
    priority: "medium",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    createdBy: "admin",
    dealId: null,
    assignedTo: "manager"
  },
  {
    title: "Review legal documents for Series A investment",
    description: "Thoroughly review all legal documents, term sheets, and contracts for the upcoming Series A investment round.",
    status: "pending",
    priority: "high",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    createdBy: "admin",
    dealId: null,
    assignedTo: "lawyer"
  },
  {
    title: "Update portfolio performance dashboard",
    description: "Refresh all portfolio company metrics, KPIs, and performance indicators in the main dashboard.",
    status: "completed",
    priority: "medium",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (completed)
    createdBy: "admin",
    dealId: null,
    assignedTo: "analyst"
  },
  {
    title: "Prepare investment committee presentation",
    description: "Create comprehensive presentation for investment committee meeting including deal analysis and recommendations.",
    status: "in_progress",
    priority: "high",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    createdBy: "admin",
    dealId: null,
    assignedTo: "associate"
  },
  {
    title: "Conduct market research for fintech opportunities",
    description: "Research emerging fintech trends, competitive landscape, and potential investment opportunities in the sector.",
    status: "pending",
    priority: "medium",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    createdBy: "admin",
    dealId: null,
    assignedTo: "researcher"
  },
  {
    title: "Review startup pitch deck for DemoCo",
    description: "Analyze pitch deck, business model, financial projections, and market opportunity for DemoCo startup.",
    status: "completed",
    priority: "medium",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (completed)
    createdBy: "admin",
    dealId: null,
    assignedTo: "associate"
  },
  {
    title: "Coordinate with external legal counsel",
    description: "Schedule calls and coordinate document review with external legal counsel for ongoing transactions.",
    status: "pending",
    priority: "medium",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    createdBy: "admin",
    dealId: null,
    assignedTo: "lawyer"
  }
]

async function seedTasks() {
  try {
    console.log('🌱 Seeding tasks...')

    // Clear existing tasks
    await prisma.task.deleteMany()

    // Get admin user for createdBy field
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('❌ No admin user found. Please create users first.')
      return
    }

    // Create sample tasks
    for (const taskData of sampleTasks) {
      const task = await prisma.task.create({
        data: {
          ...taskData,
          createdBy: adminUser.id,
          assignedTo: taskData.assignedTo ? adminUser.id : null // For demo, assign to admin if specified
        }
      })

      console.log(`✅ Created task: ${task.title}`)
    }

    console.log(`🎉 Successfully seeded ${sampleTasks.length} tasks!`)

  } catch (error) {
    console.error('❌ Error seeding tasks:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTasks()
