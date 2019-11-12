from aim.version_control.base import Base


class GitAdapter(Base):
    def get_diff(self):
        print('Git diff')
