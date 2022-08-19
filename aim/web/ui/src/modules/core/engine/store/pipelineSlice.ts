function createPipelineSlice(
  initialState: object = {
    status: 'waiting', // waiting, fetching, decoding, adopting, grouping
    additional_info: {}, // modifiers, contexts
    queryable_info: {}, // ranges info

    current_grouping: {}, // group_config {'grid': {} }
    current_query: {}, // query config, {'q': '', p: '', 'index_range': '', step_range: ''}

    result: {}, // data (flat list), found groups (groupKey: groupConfig(order, etc))
  },
) {
  const selectors = {
    additionalInfoSelector: (state: any) => state.pipeline.additional_info,
    queryableInfoSelector: (state: any) => state.pipeline.queryable_info,
    queryConfigSelector: (state: any) => state.pipeline.query_config,

    // result
    groupsSelector: (state: any) => state.pipeline.result.groups,
    dataSelector: (state: any) => state.pipeline.result.data,
    resultSelector: (state: any) => state.pipeline.result,
  };

  return {
    initialState,
    selectors,
  };
}

export default createPipelineSlice;
