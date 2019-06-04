
class DeployFromPath:
    def __init__(self, model_path):
        self.model_path = model_path

    def generate_docker(self, container_name):
        return True
