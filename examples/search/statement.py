from aim.ql.grammar import Statement


if __name__ == '__main__':
    st = Statement()
    res = st.parse("""
        loss, tf:loss if True
    """)
    print(res)
