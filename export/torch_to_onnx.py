import os
import glob
import torch
from torch.autograd import Variable

from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

from data_loader import RescaleT
from data_loader import ToTensor
from data_loader import ToTensorLab
from data_loader import SalObjDataset

from model import U2NET # full size version 173.6 MB
from model import U2NETP # small version u2net 4.7 MB

def main():
    model_name='u2netp'

    model_dir = os.path.join(os.getcwd(), 'saved_models', model_name, model_name + '.pth')
    image_dir = os.path.join(os.getcwd(), 'test_data', 'test_images')
    img_name_list = glob.glob(image_dir + os.sep + '*')

    test_salobj_dataset = SalObjDataset(img_name_list = img_name_list,
                                        lbl_name_list = [],
                                        transform=transforms.Compose([RescaleT(320),
                                                                        ToTensorLab(flag=0)])
                                        )
    test_salobj_dataloader = DataLoader(test_salobj_dataset,
                                        batch_size=1,
                                        shuffle=False,
                                        num_workers=1)

    if(model_name=='u2net'):
        print("...load U2NET---173.6 MB")
        net = U2NET(3,1)
    elif(model_name=='u2netp'):
        print("...load U2NEP---4.7 MB")
        net = U2NETP(3,1)

    net.load_state_dict(torch.load(model_dir))
    if torch.cuda.is_available():
        net.cuda()
    net.eval()

    for data_test in test_salobj_dataloader:
        inputs_test = data_test['image']
        inputs_test = inputs_test.type(torch.FloatTensor)
        if torch.cuda.is_available():
            inputs_test = Variable(inputs_test.cuda())
        else:
            inputs_test = Variable(inputs_test)

        dummy_input = inputs_test
        torch.onnx.export(net, dummy_input,"exported/onnx/{}.onnx".format(model_name),
        opset_version=10)
        
        break

if __name__ == "__main__":
    main()
