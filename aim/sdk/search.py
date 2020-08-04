from typing import Optional, List

from aim.engine.aim_repo import AimRepo
from aim.engine.run import Run
from aim.engine.configs import (
    AIM_NESTED_MAP_DEFAULT,
)
from aim.ql.grammar.statement import Statement
from aim.ql import match


def parse_search_statement(search_statement: str):
    search_statement = search_statement.strip()
    parser = Statement()
    return parser.parse(search_statement)


def search(search_statement: str) -> Optional[List[Run]]:
    repo = AimRepo.get_working_repo()

    if not repo:
        return None

    runs = {
        exp_name: [
            Run(exp_name, run_hash, repo.path)
            for run_hash in repo.list_branch_commits(exp_name)
        ]
        for exp_name in repo.list_branches()
    }

    parsed_stmt = parse_search_statement(search_statement)
    matched_runs = []
    for sub_query in parsed_stmt.node:
        name = sub_query['name']
        expr = sub_query['expression']

        for experiment_runs in runs.values():
            for run in experiment_runs:
                # Run parameters (`NestedMap`)
                params = run.params
                # Default parameters - ones passed without namespace
                default_params = run.params.get(AIM_NESTED_MAP_DEFAULT) or {}
                # Dictionary representing all search fields
                fields = {
                    'params': params,
                    'context': None,
                }
                # Easter egg
                eggs = {'shawarma': True, 'love': True}
                # Pass fields in descending order by priority
                res = match(expr, fields, params, default_params, eggs)
                if res is True:
                    matched_runs.append(run)
    return matched_runs
