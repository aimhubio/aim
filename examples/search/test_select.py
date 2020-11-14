from aim.engine.repo.repo import AimRepo
from aim.ql.grammar.statement import Statement


if __name__ == '__main__':
    repo = AimRepo.get_working_repo(mode='r')

    parser = Statement()
    parsed_stmt = parser.parse('loss if context.subset != test')
    statement_select = parsed_stmt.node['select']
    statement_expr = parsed_stmt.node['expression']

    res = repo.select(statement_select, statement_expr)
    print(res.get_selected_metrics_context())
