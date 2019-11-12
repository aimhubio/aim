from aim.version_control.base import Base


class Git(Base):
    def get_diff(self):
        ...
