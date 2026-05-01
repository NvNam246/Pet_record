// backend/config/plansConfig.js
export const PLANS = {
  FREE: "Free",
  PREMIUM: "Premium",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

export const PLAN_LIMITS = {
  [PLANS.FREE]: {
    maxPets: 1,
    maxStorageMB: 50,
    hasAI: false,
    hasTelehealth: false,
    canExport: false,
    canShareVet: false,
  },
  [PLANS.PREMIUM]: {
    maxPets: 3,
    maxStorageMB: 5120, // 5GB
    hasAI: false,
    hasTelehealth: false,
    canExport: true,
    canShareVet: false,
  },
  [PLANS.PROFESSIONAL]: {
    maxPets: 9999, // Unlimited
    maxStorageMB: 999999, // Unlimited
    hasAI: true,
    hasTelehealth: true,
    canExport: true,
    canShareVet: true,
  },
  [PLANS.ENTERPRISE]: {
    maxPets: 9999,
    maxStorageMB: 999999,
    hasAI: true,
    hasTelehealth: true,
    canExport: true,
    canShareVet: true,
    isClinicOrg: true, // Quyền riêng của gói này
  },
};
