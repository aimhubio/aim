from pprint import pprint

from aim.engine.repo.repo import AimRepo
from aim.ql.grammar.statement import Statement


if __name__ == '__main__':
    repo = AimRepo.get_working_repo(mode='r')

    parser = Statement()
    parsed_stmt = parser.parse('metric if experiment == test_metrics')
    statement_select = parsed_stmt.node['select']
    statement_expr = parsed_stmt.node['expression']

    res = repo.select(statement_select, statement_expr)

    runs_list = []
    for run in res.runs:
        runs_list.append(run.to_dict(include_only_selected_agg_metrics=True))

    pprint(runs_list)
