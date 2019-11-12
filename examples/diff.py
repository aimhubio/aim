from aim.version_control.factory import Factory

vc = Factory.create(Factory.GIT)

vc.get_diff()
