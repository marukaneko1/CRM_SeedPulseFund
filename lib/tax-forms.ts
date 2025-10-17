/**
 * Tax Forms and Compliance Database
 * Comprehensive database of tax forms, deadlines, and requirements
 */

export interface TaxForm {
  id: string
  name: string
  description: string
  category: 'federal' | 'state' | 'local' | 'payroll' | 'sales' | 'corporate'
  entityTypes: string[]
  filingFrequency: 'annual' | 'quarterly' | 'monthly' | 'as-needed'
  deadline: string
  required: boolean
  formNumber: string
  irsLink?: string
  stateLink?: string
}

export interface TaxDeadline {
  id: string
  formId: string
  description: string
  dueDate: string
  frequency: 'annual' | 'quarterly' | 'monthly'
  entityTypes: string[]
  priority: 'high' | 'medium' | 'low'
}

export const TAX_FORMS: TaxForm[] = [
  // Federal Corporate Forms
  {
    id: '1120',
    name: 'U.S. Corporation Income Tax Return',
    description: 'Annual income tax return for C corporations',
    category: 'federal',
    entityTypes: ['C-Corp'],
    filingFrequency: 'annual',
    deadline: 'March 15 (or 15th day of 3rd month after tax year end)',
    required: true,
    formNumber: 'Form 1120',
    irsLink: 'https://www.irs.gov/forms-pubs/about-form-1120'
  },
  {
    id: '1120s',
    name: 'U.S. Income Tax Return for an S Corporation',
    description: 'Annual income tax return for S corporations',
    category: 'federal',
    entityTypes: ['S-Corp'],
    filingFrequency: 'annual',
    deadline: 'March 15 (or 15th day of 3rd month after tax year end)',
    required: true,
    formNumber: 'Form 1120-S',
    irsLink: 'https://www.irs.gov/forms-pubs/about-form-1120s'
  },
  {
    id: '1065',
    name: 'U.S. Return of Partnership Income',
    description: 'Annual information return for partnerships',
    category: 'federal',
    entityTypes: ['Partnership', 'LLC'],
    filingFrequency: 'annual',
    deadline: 'March 15 (or 15th day of 3rd month after tax year end)',
    required: true,
    formNumber: 'Form 1065',
    irsLink: 'https://www.irs.gov/forms-pubs/about-form-1065'
  },
  {
    id: '1040-schedule-c',
    name: 'Schedule C - Profit or Loss from Business',
    description: 'For sole proprietorships and single-member LLCs',
    category: 'federal',
    entityTypes: ['Sole Proprietorship', 'Single-Member LLC'],
    filingFrequency: 'annual',
    deadline: 'April 15',
    required: true,
    formNumber: 'Schedule C (Form 1040)',
    irsLink: 'https://www.irs.gov/forms-pubs/about-schedule-c-form-1040'
  },

  // Payroll Tax Forms
  {
    id: '941',
    name: 'Employer\'s Quarterly Federal Tax Return',
    description: 'Quarterly payroll tax return for federal income tax, Social Security, and Medicare',
    category: 'payroll',
    entityTypes: ['C-Corp', 'S-Corp', 'LLC', 'Partnership', 'Sole Proprietorship'],
    filingFrequency: 'quarterly',
    deadline: 'Last day of month following quarter end',
    required: true,
    formNumber: 'Form 941',
    irsLink: 'https://www.irs.gov/forms-pubs/about-form-941'
  },
  {
    id: '940',
    name: 'Employer\'s Annual Federal Unemployment (FUTA) Tax Return',
    description: 'Annual federal unemployment tax return',
    category: 'payroll',
    entityTypes: ['C-Corp', 'S-Corp', 'LLC', 'Partnership', 'Sole Proprietorship'],
    filingFrequency: 'annual',
    deadline: 'January 31',
    required: true,
    formNumber: 'Form 940',
    irsLink: 'https://www.irs.gov/forms-pubs/about-form-940'
  },
  {
    id: 'w-2',
    name: 'W-2 - Wage and Tax Statement',
    description: 'Annual wage and tax statement for employees',
    category: 'payroll',
    entityTypes: ['C-Corp', 'S-Corp', 'LLC', 'Partnership', 'Sole Proprietorship'],
    filingFrequency: 'annual',
    deadline: 'January 31',
    required: true,
    formNumber: 'Form W-2',
    irsLink: 'https://www.irs.gov/forms-pubs/about-form-w-2'
  },
  {
    id: 'w-3',
    name: 'W-3 - Transmittal of Wage and Tax Statements',
    description: 'Transmittal form for W-2s',
    category: 'payroll',
    entityTypes: ['C-Corp', 'S-Corp', 'LLC', 'Partnership', 'Sole Proprietorship'],
    filingFrequency: 'annual',
    deadline: 'January 31',
    required: true,
    formNumber: 'Form W-3',
    irsLink: 'https://www.irs.gov/forms-pubs/about-form-w-3'
  },

  // Sales Tax Forms
  {
    id: 'sales-tax-return',
    name: 'State Sales Tax Return',
    description: 'Monthly/quarterly sales tax return (varies by state)',
    category: 'sales',
    entityTypes: ['C-Corp', 'S-Corp', 'LLC', 'Partnership', 'Sole Proprietorship'],
    filingFrequency: 'quarterly',
    deadline: 'Varies by state (typically 20th of month following quarter)',
    required: true,
    formNumber: 'Varies by state',
    stateLink: 'https://www.taxadmin.org/state-tax-agencies'
  },

  // State Corporate Forms
  {
    id: 'state-corporate-return',
    name: 'State Corporate Income Tax Return',
    description: 'Annual state corporate income tax return',
    category: 'state',
    entityTypes: ['C-Corp', 'S-Corp'],
    filingFrequency: 'annual',
    deadline: 'Varies by state (typically March 15 or April 15)',
    required: true,
    formNumber: 'Varies by state',
    stateLink: 'https://www.taxadmin.org/state-tax-agencies'
  },

  // Estimated Tax Forms
  {
    id: '1040-es',
    name: 'Estimated Tax for Individuals',
    description: 'Quarterly estimated tax payments for individuals',
    category: 'federal',
    entityTypes: ['Sole Proprietorship', 'Single-Member LLC'],
    filingFrequency: 'quarterly',
    deadline: 'April 15, June 15, September 15, January 15',
    required: true,
    formNumber: 'Form 1040-ES',
    irsLink: 'https://www.irs.gov/forms-pubs/about-form-1040-es'
  },
  {
    id: '1120-w',
    name: 'Corporation Estimated Tax',
    description: 'Quarterly estimated tax payments for corporations',
    category: 'federal',
    entityTypes: ['C-Corp'],
    filingFrequency: 'quarterly',
    deadline: 'April 15, June 15, September 15, December 15',
    required: true,
    formNumber: 'Form 1120-W',
    irsLink: 'https://www.irs.gov/forms-pubs/about-form-1120-w'
  }
]

export const TAX_DEADLINES: TaxDeadline[] = [
  // Annual Deadlines
  {
    id: 'annual-corp-return',
    formId: '1120',
    description: 'C Corporation Annual Return (Form 1120)',
    dueDate: 'March 15',
    frequency: 'annual',
    entityTypes: ['C-Corp'],
    priority: 'high'
  },
  {
    id: 'annual-s-corp-return',
    formId: '1120s',
    description: 'S Corporation Annual Return (Form 1120-S)',
    dueDate: 'March 15',
    frequency: 'annual',
    entityTypes: ['S-Corp'],
    priority: 'high'
  },
  {
    id: 'annual-partnership-return',
    formId: '1065',
    description: 'Partnership Annual Return (Form 1065)',
    dueDate: 'March 15',
    frequency: 'annual',
    entityTypes: ['Partnership', 'LLC'],
    priority: 'high'
  },
  {
    id: 'annual-individual-return',
    formId: '1040-schedule-c',
    description: 'Individual Tax Return with Schedule C',
    dueDate: 'April 15',
    frequency: 'annual',
    entityTypes: ['Sole Proprietorship', 'Single-Member LLC'],
    priority: 'high'
  },

  // Quarterly Deadlines
  {
    id: 'quarterly-payroll',
    formId: '941',
    description: 'Quarterly Payroll Tax Return (Form 941)',
    dueDate: 'Last day of month following quarter end',
    frequency: 'quarterly',
    entityTypes: ['C-Corp', 'S-Corp', 'LLC', 'Partnership', 'Sole Proprietorship'],
    priority: 'high'
  },
  {
    id: 'quarterly-estimated-individual',
    formId: '1040-es',
    description: 'Individual Estimated Tax Payments',
    dueDate: 'April 15, June 15, September 15, January 15',
    frequency: 'quarterly',
    entityTypes: ['Sole Proprietorship', 'Single-Member LLC'],
    priority: 'high'
  },
  {
    id: 'quarterly-estimated-corp',
    formId: '1120-w',
    description: 'Corporate Estimated Tax Payments',
    dueDate: 'April 15, June 15, September 15, December 15',
    frequency: 'quarterly',
    entityTypes: ['C-Corp'],
    priority: 'high'
  },

  // Annual Payroll Deadlines
  {
    id: 'annual-futa',
    formId: '940',
    description: 'Federal Unemployment Tax (FUTA) Return',
    dueDate: 'January 31',
    frequency: 'annual',
    entityTypes: ['C-Corp', 'S-Corp', 'LLC', 'Partnership', 'Sole Proprietorship'],
    priority: 'high'
  },
  {
    id: 'annual-w-2',
    formId: 'w-2',
    description: 'W-2 Wage and Tax Statements',
    dueDate: 'January 31',
    frequency: 'annual',
    entityTypes: ['C-Corp', 'S-Corp', 'LLC', 'Partnership', 'Sole Proprietorship'],
    priority: 'high'
  }
]

export function getTaxFormsForEntity(entityType: string): TaxForm[] {
  return TAX_FORMS.filter(form => 
    form.entityTypes.includes(entityType) || 
    form.entityTypes.includes('All')
  )
}

export function getUpcomingDeadlines(entityType: string, monthsAhead: number = 3): TaxDeadline[] {
  const now = new Date()
  const futureDate = new Date(now.getTime() + (monthsAhead * 30 * 24 * 60 * 60 * 1000))
  
  return TAX_DEADLINES.filter(deadline => 
    deadline.entityTypes.includes(entityType) &&
    new Date(deadline.dueDate + ' ' + new Date().getFullYear()) <= futureDate
  )
}

export function getRequiredForms(entityType: string): TaxForm[] {
  return TAX_FORMS.filter(form => 
    form.entityTypes.includes(entityType) && 
    form.required
  )
}

export function getTaxOptimizationTips(entityType: string): string[] {
  const tips: { [key: string]: string[] } = {
    'C-Corp': [
      'Consider Section 179 depreciation for equipment purchases',
      'Maximize business expense deductions',
      'Consider R&D tax credits for qualified research',
      'Evaluate timing of income and expenses',
      'Consider employee benefit programs'
    ],
    'S-Corp': [
      'Optimize reasonable salary vs. distributions',
      'Consider Section 199A deduction',
      'Maximize business expense deductions',
      'Consider retirement plan contributions',
      'Evaluate timing of income and expenses'
    ],
    'LLC': [
      'Choose optimal tax election (partnership vs. S-Corp)',
      'Maximize business expense deductions',
      'Consider Section 199A deduction',
      'Evaluate home office deduction',
      'Consider retirement plan contributions'
    ],
    'Partnership': [
      'Maximize business expense deductions',
      'Consider Section 199A deduction',
      'Evaluate timing of income and expenses',
      'Consider retirement plan contributions',
      'Optimize partner distributions'
    ],
    'Sole Proprietorship': [
      'Maximize business expense deductions',
      'Consider Section 199A deduction',
      'Evaluate home office deduction',
      'Consider retirement plan contributions',
      'Consider business use of vehicle'
    ]
  }
  
  return tips[entityType] || []
}
