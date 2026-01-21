export const getPagination = 
    (page?: number, limit?: number) => {
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

        return {
            page: safePage,
            limit: safeLimit,
            skip: (safePage - 1) * safeLimit,

        }

    }


export const buildPaginationMeta = (
    total: number,
    page: number,
    limit: number,


) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev : page > 1,

})