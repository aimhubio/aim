import create from 'zustand';

import experimentsService from 'services/api/experiments/experimentsService';

const useExperimentsStore = create((set) => ({
  experiments: [],
  error: {},
  fetchExperiments: async () => {
    const experiments = await experimentsService
      .getExperimentsData()
      .call((detail: any) => {
        set({ error: detail });
      });
    set({ experiments });
  },
}));

export default useExperimentsStore;
