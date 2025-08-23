import type { JobPosting, JobCreateData, JobUpdateData } from '../types/job'

// Mock job data
const mockJobs: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Senior Full Stack Developer',
    companyId: 'comp-1',
    department: 'Engineering',
    description: 'We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for building scalable web applications using modern technologies.',
    requirements: [
      { id: 'req-1', name: 'React', category: 'skill', level: 'advanced', required: true },
      { id: 'req-2', name: 'Node.js', category: 'skill', level: 'advanced', required: true },
      { id: 'req-3', name: 'TypeScript', category: 'skill', level: 'intermediate', required: true },
      { id: 'req-4', name: '5+ years experience', category: 'experience', level: 'expert', required: true }
    ],
    location: { type: 'hybrid', city: 'San Francisco', state: 'CA', country: 'USA' },
    salary: { min: 120000, max: 180000, currency: 'USD', period: 'yearly', equity: true, benefits: ['Health Insurance', '401k', 'Unlimited PTO'] },
    employmentType: 'full-time',
    experienceLevel: 'senior',
    applicationEmail: 'jobs@techcorp.com',
    status: 'published',
    publishedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    totalApplications: 45,
    activeApplications: 12
  },
  {
    id: 'job-2',
    title: 'Product Manager',
    companyId: 'comp-1',
    department: 'Product',
    description: 'Join our product team to drive the vision and execution of our flagship products. Work closely with engineering, design, and business teams.',
    requirements: [
      { id: 'req-5', name: 'Product Management', category: 'experience', level: 'advanced', required: true },
      { id: 'req-6', name: 'Agile/Scrum', category: 'skill', level: 'intermediate', required: true },
      { id: 'req-7', name: 'Data Analysis', category: 'skill', level: 'intermediate', required: true }
    ],
    location: { type: 'remote', timezone: 'PST' },
    salary: { min: 100000, max: 150000, currency: 'USD', period: 'yearly', equity: true, benefits: ['Health Insurance', '401k', 'Remote Work'] },
    employmentType: 'full-time',
    experienceLevel: 'mid',
    applicationEmail: 'jobs@techcorp.com',
    status: 'published',
    publishedAt: '2024-01-12T10:00:00Z',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
    totalApplications: 32,
    activeApplications: 8
  },
  {
    id: 'job-3',
    title: 'UX Designer',
    companyId: 'comp-1',
    department: 'Design',
    description: 'Create beautiful and intuitive user experiences for our products. Work with cross-functional teams to deliver exceptional design solutions.',
    requirements: [
      { id: 'req-8', name: 'Figma', category: 'skill', level: 'advanced', required: true },
      { id: 'req-9', name: 'User Research', category: 'skill', level: 'intermediate', required: true },
      { id: 'req-10', name: 'Design Systems', category: 'skill', level: 'intermediate', required: true }
    ],
    location: { type: 'onsite', city: 'New York', state: 'NY', country: 'USA' },
    salary: { min: 80000, max: 120000, currency: 'USD', period: 'yearly', equity: false, benefits: ['Health Insurance', '401k', 'Design Budget'] },
    employmentType: 'full-time',
    experienceLevel: 'mid',
    applicationEmail: 'jobs@techcorp.com',
    status: 'draft',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
    totalApplications: 0,
    activeApplications: 0
  }
]

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const jobService = {
  // Get all jobs for a company
  async getJobs(companyId: string): Promise<JobPosting[]> {
    await delay(500) // Simulate API call
    return mockJobs.filter(job => job.companyId === companyId)
  },

  // Get a single job by ID
  async getJob(jobId: string): Promise<JobPosting | null> {
    await delay(300)
    return mockJobs.find(job => job.id === jobId) || null
  },

  // Create a new job
  async createJob(jobData: JobCreateData, companyId: string): Promise<JobPosting> {
    await delay(800)
    const newJob: JobPosting = {
      ...jobData,
      id: `job-${Date.now()}`,
      companyId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalApplications: 0,
      activeApplications: 0
    }
    mockJobs.push(newJob)
    return newJob
  },

  // Update an existing job
  async updateJob(jobId: string, updates: JobUpdateData): Promise<JobPosting | null> {
    await delay(600)
    const jobIndex = mockJobs.findIndex(job => job.id === jobId)
    if (jobIndex === -1) return null

    const updatedJob = {
      ...mockJobs[jobIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    mockJobs[jobIndex] = updatedJob
    return updatedJob
  },

  // Delete a job
  async deleteJob(jobId: string): Promise<boolean> {
    await delay(400)
    const jobIndex = mockJobs.findIndex(job => job.id === jobId)
    if (jobIndex === -1) return false

    mockJobs.splice(jobIndex, 1)
    return true
  },

  // Publish a job
  async publishJob(jobId: string): Promise<JobPosting | null> {
    await delay(500)
    const job = mockJobs.find(job => job.id === jobId)
    if (!job) return null

    job.status = 'published'
    job.publishedAt = new Date().toISOString()
    job.updatedAt = new Date().toISOString()
    return job
  },

  // Close a job
  async closeJob(jobId: string): Promise<JobPosting | null> {
    await delay(300)
    const job = mockJobs.find(job => job.id === jobId)
    if (!job) return null

    job.status = 'closed'
    job.updatedAt = new Date().toISOString()
    return job
  }
}
