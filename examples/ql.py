from aim.ql import AbstractSyntaxTree


tree = AbstractSyntaxTree()
tree.build_from_statement('m >= n')

print(tree)
