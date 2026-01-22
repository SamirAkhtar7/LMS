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
