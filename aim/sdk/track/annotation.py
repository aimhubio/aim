from aim.sdk.track.media import Media


class Annotation:
    NAME = 'annotation'

    def __init__(self, obj, name, meta):
        if not isinstance(obj, Media):
            raise ValueError('Passed object must be of type Media')

        self.obj = obj
        self.meta = meta
        self.name = name if name else self.NAME
