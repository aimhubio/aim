import ast
import sys

from typing import Any, List, Tuple


class Unknown(ast.AST):
    pass


Unknown = Unknown()  # create a single instance of <unknown> value node

if sys.version_info.minor < 9:
    import astunparse

    def unparse(*args, **kwargs):
        return astunparse.unparse(*args, **kwargs)
else:

    def unparse(*args, **kwargs):
        return ast.unparse(*args, **kwargs)


class QueryExpressionTransformer(ast.NodeTransformer):
    def __init__(self, *, var_names: List[str]):
        self._var_names = var_names

    def transform(self, expr: str) -> Tuple[str, bool]:
        if expr:
            node = ast.parse(expr, mode='eval')
            transformed = self.visit(node)
            if transformed is Unknown:
                return expr, False
            else:
                return unparse(transformed), True
        else:
            return expr, False

    def visit_Expression(self, node: ast.Expression) -> Any:
        node: ast.Expression = self.generic_visit(node)
        if node.body is Unknown:
            return Unknown
        return node

    def visit_Expr(self, node: ast.Expr) -> Any:
        node: ast.Expr = self.generic_visit(node)
        if node.value is Unknown:
            return Unknown
        return node

    def visit_Constant(self, node: ast.Constant) -> Any:
        return node

    def visit_JoinedStr(self, node: ast.JoinedStr) -> Any:
        node: ast.JoinedStr = self.generic_visit(node)
        for val in node.values:
            if val is Unknown:
                return Unknown
        return node

    def visit_FormattedValue(self, node: ast.FormattedValue) -> Any:
        node: ast.FormattedValue = self.generic_visit(node)
        if node.value is Unknown:
            return Unknown
        return node

    def visit_Name(self, node: ast.Name) -> Any:
        if node.id in self._var_names:
            return Unknown
        else:
            return node

    def visit_Compare(self, node: ast.Compare) -> Any:
        node: ast.Compare = self.generic_visit(node)
        if node.left is Unknown:
            return Unknown
        for comp in node.comparators:
            if comp is Unknown:
                return Unknown
        return node

    def visit_List(self, node: ast.List) -> Any:
        node: ast.List = self.generic_visit(node)
        for sub in node.elts:
            if sub is Unknown:
                return Unknown
        return node

    def visit_Tuple(self, node: ast.Tuple) -> Any:
        node: ast.Tuple = self.generic_visit(node)
        for sub in node.elts:
            if sub is Unknown:
                return Unknown
        return node

    def visit_Dict(self, node: ast.Dict) -> Any:
        node: ast.Dict = self.generic_visit(node)
        for key in node.keys:
            if key is Unknown:
                return Unknown
        for val in node.values:
            if val is Unknown:
                return Unknown
        return node

    def visit_BoolOp(self, node: ast.BoolOp) -> Any:
        node: ast.BoolOp = self.generic_visit(node)
        node_values = list(filter(lambda x: x is not Unknown, node.values))
        if isinstance(node.op, ast.And):
            if len(node_values) == 1:
                return node_values[0]
            elif len(node_values) == 0:
                return Unknown
        else:
            if len(node_values) < len(node.values):
                return Unknown
        return ast.BoolOp(op=node.op, values=node_values)

    def visit_UnaryOp(self, node: ast.UnaryOp) -> Any:
        node: ast.UnaryOp = self.generic_visit(node)
        if node.operand is Unknown:
            return Unknown
        return node

    def visit_BinOp(self, node: ast.BinOp) -> Any:
        node: ast.BinOp = self.generic_visit(node)
        if node.left is Unknown or node.right is Unknown:
            return Unknown
        return node

    def visit_IfExp(self, node: ast.IfExp) -> Any:
        node: ast.IfExp = self.generic_visit(node)
        if node.test is Unknown or node.body is Unknown or node.orelse is Unknown:
            return Unknown
        return node

    def visit_Attribute(self, node: ast.Attribute) -> Any:
        node: ast.Attribute = self.generic_visit(node)
        if node.value is Unknown:
            return Unknown
        return node

    def visit_Call(self, node: ast.Call) -> Any:
        node: ast.Call = self.generic_visit(node)
        if node.func is Unknown:
            return Unknown
        for arg in node.args:
            if arg is Unknown:
                return Unknown
        for kwarg in node.keywords:
            if kwarg is Unknown:
                return Unknown
        return node

    def visit_Subscript(self, node: ast.Subscript) -> Any:
        node: ast.Subscript = self.generic_visit(node)
        if node.value is Unknown or node.slice is Unknown:
            return Unknown
        return node

    def visit_Slice(self, node: ast.Slice) -> Any:
        node: ast.Slice = self.generic_visit(node)
        if node.lower is Unknown or node.upper is Unknown or node.step is Unknown:
            return Unknown
        return node
