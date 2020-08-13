from aim.sdk import select
from aim.engine.repo import AimRepo
from aim.ql.grammar.statement import Statement


if __name__ == '__main__':
    res = select('loss if '
                 'context.subset == train '
                 )

    print(res)
