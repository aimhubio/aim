from aim.origin.metadata import ModelMetadata
import tarfile
import os
import shutil


class ModelWrapper():
    def __init__(self):
        self.dest_path = ''
        self.model_path = ''
        self.dest_name = ''
        self.metadata = {}

    def from_dest(self, dest_path):
        self.dest_path = dest_path
        return self

    def wrap_model(self, model_path):
        self.model_path = model_path
        return self

    def with_name(self, dest_name):
        self.dest_name = dest_name
        return self

    def with_metadata(self, metadata):
        self.metadata = metadata
        return self

    def pack(self):
        # TODO: use stringIO for direct string to bytes to tar
        # piping of the json file instead of save and remove.
        meta = ModelMetadata()
        framework = self.metadata['framework']
        framework_version = self.metadata['framework_version']
        meta.add_framework(framework).add_framework_version(framework_version)
        metadata_path = os.path.abspath(self.dest_path + '/metadata.json')
        meta.serialize(metadata_path)
        file_path = os.path.abspath(self.dest_path + '/' + self.dest_name)
        source_model_dir, source_model = os.path.split(self.model_path)
        tar = tarfile.open(name=file_path + '.tar.gz', mode='w:gz')
        tar.addfile(tarfile.TarInfo('metadata.json'), open(metadata_path))
        tar.addfile(tarfile.TarInfo(source_model), open(self.model_path))
        tar.close()
        os.remove(metadata_path)

    def unpack(self, unpack_dest_path):

        if not os.path.exists(unpack_dest_path):
            os.makedirs(unpack_dest_path)
        else:
            shutil.rmtree(unpack_dest_path)
        file_path = os.path.abspath(self.dest_path + '/' + self.dest_name)
        # TODO: improve the hardcoded way of tar.gz extension
        tar = tarfile.open(file_path + '.tar.gz', "r:gz")
        for tarinfo in tar:
            tar.extract(tarinfo, unpack_dest_path)
        tar.close()
