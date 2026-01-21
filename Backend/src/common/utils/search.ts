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
