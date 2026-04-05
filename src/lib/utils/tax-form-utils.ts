/**
 * Tax Form Service Utilities
 * Helper functions for tax forms and document handling
 */

export class TaxFormUtils {
  /**
   * Calculate GST amount
   */
  static calculateGST(amount: number, rate: number = 18): number {
    return (amount * rate) / 100;
  }

  /**
   * Calculate taxable income after deductions
   */
  static calculateTaxableIncome(
    totalIncome: number,
    deductions: Record<string, number>
  ): number {
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
    return Math.max(totalIncome - totalDeductions, 0);
  }

  /**
   * Calculate tax slab for given income (India 2024-25)
   */
  static calculateIncomeTax(taxableIncome: number, regime: 'old' | 'new' = 'new'): number {
    if (regime === 'new') {
      // New tax regime slabs (2024-25)
      if (taxableIncome <= 300000) return 0;
      if (taxableIncome <= 600000) return (taxableIncome - 300000) * 0.05;
      if (taxableIncome <= 900000) return 15000 + (taxableIncome - 600000) * 0.1;
      if (taxableIncome <= 1200000) return 45000 + (taxableIncome - 900000) * 0.15;
      if (taxableIncome <= 1500000) return 90000 + (taxableIncome - 1200000) * 0.2;
      return 150000 + (taxableIncome - 1500000) * 0.3;
    } else {
      // Old tax regime slabs
      if (taxableIncome <= 250000) return 0;
      if (taxableIncome <= 500000) return (taxableIncome - 250000) * 0.05;
      if (taxableIncome <= 1000000) return 12500 + (taxableIncome - 500000) * 0.2;
      return 112500 + (taxableIncome - 1000000) * 0.3;
    }
  }

  /**
   * Get ITR form type based on income and source
   */
  static getITRFormType(
    totalIncome: number,
    hasBusiness: boolean,
    hasCapitalGains: boolean
  ): string {
    if (hasCapitalGains && hasBusiness) return 'ITR-4';
    if (hasBusiness && totalIncome > 5000000) return 'ITR-4';
    if (hasCapitalGains) return 'ITR-2';
    if (totalIncome > 5000000 || hasBusiness) return 'ITR-3';
    return 'ITR-1';
  }

  /**
   * Validate PAN format
   */
  static validatePAN(pan: string): boolean {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }

  /**
   * Validate GSTIN format
   */
  static validateGSTIN(gstin: string): boolean {
    const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{3}$/;
    return gstinRegex.test(gstin);
  }

  /**
   * Validate Aadhar format
   */
  static validateAadhar(aadhar: string): boolean {
    const aadharRegex = /^\d{12}$/;
    return aadharRegex.test(aadhar);
  }

  /**
   * Get required documents for service type
   */
  static getRequiredDocuments(serviceType: string): string[] {
    const documentMap: Record<string, string[]> = {
      ITR_FILING: ['PAN', 'AadhaarCard', 'Form16', 'BankStatement', 'InvestmentProofs', 'RentReceipts'],
      GST_REGISTRATION: ['PAN', 'AadhaarCard', 'AddressProof', 'BusinessProof', 'BankDetails'],
      GST_RETURN: ['PreviousInvoices', 'PurchaseInvoices', 'BankStatement'],
      AUDIT: ['CashBook', 'LedgerAccount', 'TrialBalance', 'BankReconciliation', 'FixedAssetSchedule'],
      PAYROLL: ['EmployeeList', 'SalarySlips', 'BankDetails', 'AadhaarCards'],
    };
    return documentMap[serviceType] || [];
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = 'INR'): string {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    });
    return formatter.format(amount);
  }

  /**
   * Calculate financial year from date
   */
  static getFinancialYear(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month >= 4) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  /**
   * Get financial year date range
   */
  static getFinancialYearRange(fy: string): { start: Date; end: Date } {
    const [startYear] = fy.split('-').map(Number);
    const start = new Date(startYear, 3, 1); // April 1
    const end = new Date(startYear + 1, 2, 31); // March 31
    return { start, end };
  }

  /**
   * Calculate compliance deadline days remaining
   */
  static daysRemainingForDeadline(dueDate: Date): number {
    const today = new Date();
    const diff = dueDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get deadline status
   */
  static getDeadlineStatus(daysRemaining: number): 'pending' | 'due_soon' | 'overdue' {
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 7) return 'due_soon';
    return 'pending';
  }

  /**
   * Standard tax exemptions for India (2024-25)
   */
  static getTaxExemptions(): Record<string, number> {
    return {
      basicExemption: 300000, // New regime
      lifeInsurance: 150000, // Section 80C
      fixedDeposit: 50000, // Section 80C
      studentLoan: 150000, // Section 80E
      educationInterest: 50000, // Section 80E
      parentCare: 100000, // Section 80DDB
      healthInsurance: 75000, // Section 80D
      investmentInStartup: 100000, // Section 80IAC
    };
  }
}

export default TaxFormUtils;
