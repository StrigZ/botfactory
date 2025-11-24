export const botKeys = {
  all: ['bots'] as const,
  lists: () => [...botKeys.all, 'list'] as const,
  //   list: (filters) => [...botKeys.lists(), { filters }] as const,
  details: () => [...botKeys.all, 'detail'] as const,
  detail: (id: string) => [...botKeys.details(), id] as const,
};

export const workflowKeys = {
  all: ['workflows'] as const,
  details: () => [...workflowKeys.all, 'detail'] as const,
  detail: (id: string) => [...workflowKeys.details(), id] as const,
  detailsWithNodes: () => [...workflowKeys.all, 'detailWithNodes'] as const,
  detailWithNodes: (id: string) =>
    [...workflowKeys.detailsWithNodes(), id] as const,
};

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
};
