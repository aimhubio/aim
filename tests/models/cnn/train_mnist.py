from aim.export import save_model
import torch
import torch.nn as nn
import torch.nn.functional as F

model_path = '/Users/gevorg/repos/sgevorg/aim/.aim/models/test/0977'
onnx_path = '/Users/gevorg/repos/sgevorg/aim/.aim/temp-onnx/mnist-test-1.onnx'
final_dest = '/Users/gevorg/repos/sgevorg/aim/.aim/models/test'


class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(1, 20, 5, 1)
        self.conv2 = nn.Conv2d(20, 50, 5, 1)
        self.fc1 = nn.Linear(4 * 4 * 50, 500)
        self.fc2 = nn.Linear(500, 10)

    def forward(self, x):
        # process the minibatch
        x = F.relu(self.conv1(x))
        x = F.max_pool2d(x, 2, 2)
        x = F.relu(self.conv2(x))
        x = F.max_pool2d(x, 2, 2)
        x = x.view(-1, 4 * 4 * 50)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return F.log_softmax(x, dim=1)


checkpoint = torch.load(model_path)
model = Net()
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()
# for p in model.parameters():
#     print(p.size())

x = torch.rand(1, 1, 28, 28)

metadata = {
    'input': [
        {
            'shape': [1, 1, 28, 28],
            'type': 'float32'
        }
    ],
    'framework': 'pytorch'
}

save_model(model, metadata, final_dest, 'mnist-test02')
