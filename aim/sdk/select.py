from typing import Optional

from aim.engine.repo import AimRepo
from aim.ql.grammar.statement import Statement
from aim.ql.grammar.expression import Expression


def select_metrics(search_statement: str, repo_path: Optional[str] = None):
    if repo_path is not None:
        repo = AimRepo(repo_full_path=repo_path)
    else:
        repo = AimRepo.get_working_repo(mode=AimRepo.READING_MODE)

    if not repo:
        return None

    parser = Statement()
    parsed_stmt = parser.parse(search_statement.strip())
    statement_select = parsed_stmt.node['select']
    statement_expr = parsed_stmt.node['expression']

    if 'run.archived' not in search_statement:
        default_expression = 'run.archived is not True'
    else:
        default_expression = None

    return repo.select_metrics(statement_select,
                               statement_expr, default_expression)


def select_runs(expression: Optional[str] = None,
                repo_path: Optional[str] = None):
    if repo_path is not None:
        repo = AimRepo(repo_full_path=repo_path)
    else:
        repo = AimRepo.get_working_repo(mode=AimRepo.READING_MODE)

    if not repo:
        return None

    if expression and 'run.archived' not in expression:
        default_expression = 'run.archived is not True'
    else:
        default_expression = None

    return repo.select_runs(expression, default_expression)
