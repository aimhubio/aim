from pprint import pprint

from aim.engine.repo.repo import AimRepo
from aim.ql.grammar.statement import Statement


if __name__ == '__main__':
    repo = AimRepo.get_working_repo(mode='r')

    query = 'metric_2, metric ' \
            ' if experiment in (test_metrics, test_metrics_2)' \
            ' and context.foo == baz and params.default.baz > 1'

    parser = Statement()
    parsed_stmt = parser.parse(query)
    statement_select = parsed_stmt.node['select']
    statement_expr = parsed_stmt.node['expression']

    res = repo.select(statement_select, statement_expr)

    runs_list = []
    for run in res.runs:
        runs_list.append(run.to_dict(include_only_selected_agg_metrics=True))

    pprint(runs_list)
