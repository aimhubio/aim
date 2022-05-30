## Sign In

Sign in to the `Azure portal`.

## Create virtual machine

Enter `virtual machines` in the search or click `Virtual machines` under Azure services.

![](../_static/images/using/azure/azure_home.png)

Under Services, select `Virtual machines`.

![](../_static/images/using/azure/azure_home_2.png)

In the Virtual machines page, select `Create` and then `Azure Virtual machine`.

![](../_static/images/using/azure/azure_vm_create.png)

The Create a virtual machine page opens.
In the Basics tab, under Project details, make sure the correct subscription is selected and then choose to Create new resource group. Enter `<name-of-your-choice>` for the name. `aim-rg` will be used in this tutorial

![](../_static/images/using/azure/resourcegrp.png)

Under Instance details, enter azurevm for the Virtual machine name, and choose `Ubuntu 20.04 LTS - Gen2` for your Image. Leave the other defaults. The default size and pricing is only shown as an example. Size availability and pricing are dependent on your region and subscription.
The `Standard_E2s_v3 - 2 vcpus, 16 GiB` memory will be used in this tutorial

![](../_static/images/using/azure/azure_vm_create_2.png)

Set authentication type to password. 
Then set username and password and remember it as you will use it to login to your vm.
 
Leave the remaining defaults and then select the `Review + create` button at the bottom of the page.
It will take you to a service pricing webpage. Go through it. When you are done, select Create.

![](../_static/images/using/azure/create.png)

Afte VM deploys finish, click on `Go to resource`.

![](../_static/images/using/azure/complete.png)

Copy Public IP address

![](../_static/images/using/azure/ip.png)

## Connect to virtual machine

I am using a Putty - a free ssh client to connect with vm.
Download link - https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
Select the 64 bit - x86 one (first option).

Then open putty.
Then paste the `Public IP address` to this Host Name (or IP address)  field.

![](../_static/images/using/azure/putty.png)

It will open your linux vm like this and ask for login as.

![](../_static/images/using/azure/vm_login_user.png)

Now type the `username` in this and then the password.
It will be shown something like this with `vm_name@username` format.

![](../_static/images/using/azure/user.png)

Now install the required packeges by running thi command in vm. - 
```
sudo apt-get install python3 python3-pip python3-venv
```

Then make a directory as project and go into it.
```
# prepare project dir
mkdir ~/project
cd ~/project
```

![](../_static/images/using/azure/project_dir.png)

Now, creates a virtualenv using this command and activate it.

```python
# create virtual env
python3 -m venv .venv
source .venv/bin/activate
```

![](../_static/images/using/azure/vm_venv.png)

Now, install aim in this environment.
```python
pip install aim
```

And write this in terminal
```
vim main.py
```
<write your code in main.py>

And write this code in that main.py file.

```
from aim import Run

# Initialize a new run
run = Run()

# Log run parameters
run["hparams"] = {
    "learning_rate": 0.001,
    "batch_size": 32,
}

# Log metrics
for i in range(10):
    run.track(i, name='loss', step=i, context={ "subset":"train" })
    run.track(i, name='acc', step=i, context={ "subset":"train" })

```

![](../_static/images/using/azure/main.png)

Now, save the code and run
```python
 python ./main.py .  
 ```

Now wait for it to complete.

After that, write ``` aim up --host 0.0.0.0 ```  in terminal.

![](../_static/images/using/azure/aim_up.png)

Now, before going to the ` http://127.0.0.1:43800 `, replace ` 0.0.0.0` with your `vm-address` which the `public ip address` of your vm. 

![](../_static/images/using/azure/port_error.png)

It is showing error and not working because we didn’t added the specified port in azure yet.

now go and open your vm in azure portal and go to `networking.`

![](../_static/images/using/azure/networking_ui.png)

Now, click on `add inbound port rule.`

![](../_static/images/using/azure/networking_add_port.png)

Now write `43800` in destination port ranges and change protocol to `TCP`. 
And click Add.

![](../_static/images/using/azure/add_inbound_port.png)

Now, go to your browser and reload the page, if it does not work then restart `aim-up --host 0.0.0.0 `again and open the link in the browser again. You will see something like this in the browser.

![](../_static/images/using/azure/aim_ui.png)
