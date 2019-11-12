from aim.version_control.git import GitAdapter


class Factory:
    GIT = 'git'

    factories = {
        GIT: GitAdapter,
    }

    @classmethod
    def create(cls, vc_id):
        if vc_id not in cls.factories:
            raise AttributeError('\'Factory\' object has no ' +
                                 'attribute \'{}\''.format(vc_id))
        else:
            return cls.factories[vc_id]()
