from aim.version_control.git import Git


class Factory:
    factories = {
        'git': Git,
    }

    @classmethod
    def create(cls, vc_id):
        if vc_id not in cls.factories:
            raise AttributeError('\'Factory\' object has no ' +
                                 'attribute \'{}\''.format(vc_id))
        else:
            return cls.factories[vc_id]()
