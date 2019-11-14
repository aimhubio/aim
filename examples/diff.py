from aim.version_control.factory import Factory

vc = Factory.create(Factory.GIT)

vc.commit_changes_to_branch('hey', 'foo')
