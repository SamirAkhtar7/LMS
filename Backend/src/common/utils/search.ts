export const buildLoanApplicationSearch = (q?: string) => {
  if (!q) return {};

  return {
    OR: [
      {
        loanNumber: {
          contains: q,
        },
      },
      {
        customer: {
          firstName: {
            contains: q,
          },
        },
      },
      {
        customer: {
          lastName: {
            contains: q,
          },
        },
      },
      {
        customer: {
          email: {
            contains: q,
          },
        },
      },
      {
        customer: {
          contactNumber: {
            contains: q,
          },
        },
      },
      {
        customer: {
          panNumber: {
            contains: q,
          },
        },
      },
      {
        customer: {
          aadhaarNumber: {
            contains: q,
          },
        },
      },
    ],
  };
};

export const buildDocumentSearch = (q?: string) => {
  if (!q) return {};

  return {
    OR: [
      {
        loanApplication: {
          loanNumber: {
            contains: q,
          },
        },
      },
      {
        loanApplication: {
          customer: {
            firstName: {
              contains: q,
            },
          },
        },
      },
      {
        loanApplication: {
          customer: {
            lastName: {
              contains: q,
            },
          },
        },
      },
      {
        loanApplication: {
          customer: {
            contactNumber: {
              contains: q,
            },
          },
        },
      },
    ],
  };
};

export const buildPartnerSearch = (q?: string) => {
  if (!q) return {};
  return {
    OR: [
      {
        user: {
          is: {
            userName: { contains: q },
          },
        },
      },
      {
        partnerId: {
          contains: q,
        },
      },
      {
        user: {
          is: {
            contactNumber: { contains: q },
          },
        },
      },
    ],
  };
};

// helpers/buildEmployeeSearch.ts
export const buildEmployeeSearch = (q?: string) => {
  if (!q) return {};

  return {
    OR: [
      {
        employeeId: { contains: q },
      },
      {
        mobileNumber: { contains: q },
      },
      {
        user: {
          is: {
            fullName: { contains: q },
          },
        },
      },
      {
        user: {
          is: {
            email: { contains: q },
          },
        },
      },
      {
        user: {
          is: {
            userName: { contains: q },
          },
        },
      },
      {
        user: {
          is: {
            contactNumber: { contains: q },
          },
        },
      },
    ],
  };
};

// lead.search.ts
export const buildLeadSearch = (q?: string) => {
  if (!q) return {};

  return {
    OR: [
      {
        leadNumber: {
          contains: q,
        },
      },
      {
        fullName: {
          contains: q,
        },
      },

      {
        contactNumber: {
          contains: q,
        },
      },
    ],
  };
};

export const buildEmiSearch = (q?: string) => {
  if (!q) return {};
  return {
    OR: [
      {
        loanApplication: {
          loanNumber: {
            contains: q,
          },
        },
      },
      {
        loanApplication: {
          customer: {
            aadhaarNumber: {
              contains: q,
            },
          },
        },
      },
      {
        loanApplication: {
          customer: {
            panNumber: {
              contains: q,
            },
          },
        },
      },
      {
        loanApplication: {
          customer: {
            contactNumber: {
              contains: q,
            },
          },
        },
      },
    ],
  };
};

export const buildLoanTypeSearch = (q?: string) => {
  if (!q) return {};
  return {
    OR: [
      {
        name: {
          contains: q,
        },
      },
      {
        code: {
          contains: q,
        },
      },
    ],
  };
};

export const RECOVERY_STATUSES = [
  "ONGOING",
  "IN_PROGRESS",
  "SETTLED",
  "WRITTEN_OFF",
] as const;

export const RECOVERY_STAGES = [
  "INITIAL_CONTACT",
  "LEGAL_NOTICE",
  "FIELD_VISIT",
  "SETTLEMENT",
] as const;

export const buildRecoverySearch = (q?: string) => {
  if (!q) return {};

  const OR: any[] = [];

  // Loan
  OR.push({
    loanApplication: {
      loanNumber: { contains: q },
    },
  });

  // Customer
  OR.push(
    { customer: { firstName: { contains: q } } },
    { customer: { lastName: { contains: q } } },
    { customer: { contactNumber: { contains: q } } },
    { customer: { panNumber: { contains: q } } },
  );

  // ✅ Enum-safe search
  if (RECOVERY_STATUSES.includes(q as any)) {
    OR.push({ recoveryStatus: q });
  }

  if (RECOVERY_STAGES.includes(q as any)) {
    OR.push({ recoveryStage: q });
  }

  return { OR };
};


export const buildSettlementSearch = (q?: string) => {
  if (!q) return {};

  const OR: any[] = [];

  // Loan
  OR.push({
    loanApplication: {
      loanNumber: { contains: q },
    },
  });

  // Customer
  OR.push(
    { loanApplication: { customer: { firstName: { contains: q } } } },
    { loanApplication: { customer: { lastName: { contains: q } } } },
    { loanApplication: { customer: { contactNumber: { contains: q } } } },
    { loanApplication: { customer: { panNumber: { contains: q } } } },
  );

  // Enum-safe filters
  if (RECOVERY_STATUSES.includes(q as any)) {
    OR.push({ recoveryStatus: q });
  }

  if (RECOVERY_STAGES.includes(q as any)) {
    OR.push({ recoveryStage: q });
  }

  return { OR };
};
