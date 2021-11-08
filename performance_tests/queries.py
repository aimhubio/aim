query_1 = 'run.hparams.benchmark == "glue" ' \
          'and run.hparams.dataset == "cola" ' \
          'and metric.context.subset != "train"'
query_2 = 'run.hparams.benchmark == "glue" ' \
          'and run.hparams.dataset == "cola"'
query_3 = 'run.hparams.benchmark == "glue"'
query_4 = 'run.hparams.dataset == "cola" ' \
          'and run.experiment.name != "baseline-warp_4-cola"'


queries = {
    1: query_1,
    2: query_2,
    3: query_3,
    4: query_4
}
