# Tags page
### Overview
Tags functionality intended to mark a runs. A tag can be attached to the runs to distribute by segments and then find it quickly.
### Create tag
How to create tag ? 
There are two options for creating a tag. 
##### First option:
- Go to the tags page by clicking on the Tags from the left sidebar  

- Click on the create tag button to open the create tag form modal

.. note::
    In this modal there is the form that has two input fields first one for tag name the second one for tag comment and also there are exist color pallets for selecting tag color.

<img style="border: 1px solid #1d2253" alt="Create tag" src="https://user-images.githubusercontent.com/8737693/155541925-0a6b7b97-aa50-4782-b72d-0d8934403a5d.png">

- Type name for a tag 

.. note::
    Name filed is mandatory and can't be empty for tag creation form and has maximum 50 symbol limit validation 

- Type comment for a tag 

.. note::
    Comment field is optional for tag creation form and has max 200 symbol limit validation

- Select color for a tag from the color pallet

.. note::
    Optional there are default selected colors for tag

- Click to the create button for saving a the tag then. After successful saving should appear toaster approving the create on the right top corner of the window.

<img style="border: 1px solid #1d2253" alt="Create tag modal" src="https://user-images.githubusercontent.com/8737693/155467896-034d7541-9d2a-4737-a40e-e02d3256ba14.png">

##### Second option:
- Go to any explorer page (metrics, params, images, scatters) 
- Click to one of the sequence unit to open popover where is exist tag section with attach button
- Click on attach button to open the select tag popover where you will see all your previously created tags

<img style="border: 1px solid #1d2253" alt="Attach tag popover" src="https://user-images.githubusercontent.com/8737693/155469136-5224eeb5-d4f9-4a67-8a79-067916d828dc.png">

- Click create tag button and you will be redirected to the tags page than the actual first option

<img style="border: 1px solid #1d2253" alt="Attach tag popover" src="https://user-images.githubusercontent.com/8737693/155469559-89b86553-25ec-4a17-9b53-c539699a754f.png">

### Attach tag
How to attach tag to the run ?
- Go to any explorer page (metrics, params, images, scatters) 
- Click to one of the sequence unit to open popover where is exist tag section with attach button

<img style="border: 1px solid #1d2253" alt="Attach tag popover" src="https://user-images.githubusercontent.com/8737693/155469136-5224eeb5-d4f9-4a67-8a79-067916d828dc.png">

- Click on attach button to open the select tag popover where will be visible all tags
- Select a tag you want to attach to the sequence unit

<img style="border: 1px solid #1d2253" alt="Select tag popover" src="https://user-images.githubusercontent.com/8737693/155469265-5559e0dc-7e96-4e9e-abf6-5ddbd998baa5.png">

.. note::
    You can select more then on tag for each point

### Update attached tags
How to update attached tags ?
- Go to any explorer page (metrics, params, images, scatters)
- Select point which you want to attach tag and click on it to open popover where is the exist tag section. In tags section will be visible already attached tags
- Click on attach button for adding new tag to open the select tag popover where will be visible all existing tags

<img style="border: 1px solid #1d2253" alt="Select tag popover" src="https://user-images.githubusercontent.com/8737693/155528699-0c6bfa51-77bc-4a61-a6a8-6151cd7c74b4.png">

- Click on x icon in the right end of the each tag for removing the tag from the point

<img style="border: 1px solid #1d2253" alt="Select tag popover" src="https://user-images.githubusercontent.com/8737693/155529480-0e13a8af-0eb9-4409-8d9f-9b7ed273eda6.png">

### Edit tag
#### How to edit tag ?
- Go to the tags page
- Click to edit icon in the right side in the tag row

<img style="border: 1px solid #1d2253" alt="Tags table" src="https://user-images.githubusercontent.com/8737693/155471536-9da1f333-8cc8-487d-b815-bb47604edb2f.png">

- Then should appear the edit modal

.. note::
    In the edit modal there is the form that has two input fields first one for tag name the second one for tag comment and also there are exist color pallets for selecting tag color. In this modal is possible to make changes for tag

- Make changes you need
- Then you have three possible actions close modal, save changes and reset changes. After closing the modal you will lose all changes, after clicking the reset button modal form fields will be reset to initial values and by clicking the save button you will save all changes for the tag. After successful saving should appear toaster approving the update on the right top corner of the window.

<img style="border: 1px solid #1d2253" alt="Tags edit modal" src="https://user-images.githubusercontent.com/8737693/155471713-842b486a-e215-4a4a-8bf3-5d78c1739f78.png">

### Delete tag
How to delete tag ?
- Go to the tags page
- Click on the trash icon in the right side in the tag row to open the delete modal

<img style="border: 1px solid #1d2253" alt="Select tag popover" src="https://user-images.githubusercontent.com/8737693/155471125-1c09225a-2306-4fbb-b4e0-a983e717a143.png">

- In the delete modal there is a tag name input field and a tag name label at the top of the tag name input. You need to type the tag name for approving you are want to delete that tag.
- Then you have two possible actions delete the tag or close the modal by canceling the delete operation. If you want to delete a tag please double-check the tag name and click to delete button. After tag deletion, there are no possibilities to recover it. Also if you are deleting the tag it will be removed from all relations too

<img style="border: 1px solid #1d2253" alt="Select tag popover" src="https://user-images.githubusercontent.com/8737693/155471204-55c98058-aaff-4ca3-8317-77a25554a3fc.png">

### Used in overlay.
In the tags page you can select tag by clicking on circle icon then will opened overlay in the right side of window. Here is visible that runs which are use the tag. By clicking a run hash you will be redirected to single run page.

<img style="border: 1px solid #1d2253" alt="Tags delete modal" src="https://user-images.githubusercontent.com/8737693/155531375-d4012c2d-ddf0-49c1-9f57-e4d3db63ce86.png">