// Hierarchical query keys for assessment first phase resources.

export const questionBanksKeys = {
  all: ["question-banks"] as const,
  lists: () => [...questionBanksKeys.all, "list"] as const,
  list: (params: Record<string, unknown> | undefined) =>
    [
      ...questionBanksKeys.lists(),
      params
        ? JSON.stringify(
            Object.keys(params)
              .sort()
              .reduce((a: any, k) => {
                a[k] = (params as any)[k];
                return a;
              }, {})
          )
        : "all",
    ] as const,
  detail: () => [...questionBanksKeys.all, "detail"] as const,
  byId: (id: number) => [...questionBanksKeys.detail(), id] as const,
};

export const questionsKeys = {
  all: ["questions"] as const,
  lists: () => [...questionsKeys.all, "list"] as const,
  list: (params: Record<string, unknown> | undefined) =>
    [
      ...questionsKeys.lists(),
      params
        ? JSON.stringify(
            Object.keys(params)
              .sort()
              .reduce((a: any, k) => {
                a[k] = (params as any)[k];
                return a;
              }, {})
          )
        : "all",
    ] as const,
  detail: () => [...questionsKeys.all, "detail"] as const,
  byId: (id: number) => [...questionsKeys.detail(), id] as const,
};

export const optionSetsKeys = {
  all: ["option-sets"] as const,
  lists: () => [...optionSetsKeys.all, "list"] as const,
  list: (params: Record<string, unknown> | undefined) =>
    [
      ...optionSetsKeys.lists(),
      params
        ? JSON.stringify(
            Object.keys(params)
              .sort()
              .reduce((a: any, k) => {
                a[k] = (params as any)[k];
                return a;
              }, {})
          )
        : "all",
    ] as const,
  detail: () => [...optionSetsKeys.all, "detail"] as const,
  byId: (id: number) => [...optionSetsKeys.detail(), id] as const,
  options: (optionSetId: number) =>
    [...optionSetsKeys.byId(optionSetId), "options"] as const,
};
