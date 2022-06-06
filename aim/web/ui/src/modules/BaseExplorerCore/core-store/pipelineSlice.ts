function createPipelineSlice() {
  const initialState = {
    query: {},
    grouping: {},
    data: {},
    additionalData: {},
  };

  const methods = {
    search() {},
    group() {},
    reset() {},
  };

  const selectors = {
    foundGroupsSelector: (state: any) => state.grouping.foundGroups,
    groupConfigSelector: (state: any) => state.grouping.groupConfig,
  };
}

export default createPipelineSlice;
