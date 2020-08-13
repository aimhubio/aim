from aim.engine.repo import AimRepo
from aim.ql.grammar.statement import Statement


def parse_search_statement(search_statement: str):
    search_statement = search_statement.strip()
    parser = Statement()
    return parser.parse(search_statement)


def select(search_statement: str):
    repo = AimRepo.get_working_repo(mode=AimRepo.READING_MODE)

    if not repo:
        return None

    parser = Statement()
    parsed_stmt = parser.parse(search_statement.strip())
    statement_select = parsed_stmt.node['select']
    statement_expr = parsed_stmt.node['expression']

    return repo.select_metrics(statement_select, statement_expr)
