# Tags page
### Overview
Tags functionality intended to mark a runs. A tag can be attached to the runs to distribute by segments and then find it quickly.
### Create tag
How to create tag? 
There are two options for creating a tag. 
##### First option
- Go to the tags page by clicking on the Tags from the left sidebar.

- Click on the create tag button to open the create tag form modal. In this modal there is the form that has two input fields first one for tag name the second one for tag comment and also there are exist color pallets for selecting tag color.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Create tag" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/1.png">

- Type name for a tag. Name filed is mandatory and can't be empty for tag creation form and has maximum 50 symbol limit validation.
- Type comment for a tag. Comment field is optional for tag creation form and has max 200 symbol limit validation. 
- Select color for a tag from the color pallet.
- Click to the create button for saving a the tag then. After successful saving should appear toaster approving the create on the right top corner of the window. Optional there are default selected colors for tag.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Create tag modal" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/2.png">

##### Second option
- Go to any explorer page (metrics, params, images, scatters).
- Click to one of the sequence unit to open popover where is exist tag section with attach button.
- Click on attach button to open the select tag popover where you will see all your previously created tags.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Attach tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/3.png">

- Click create tag button and you will be redirected to the tags page than the actual first option.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Attach tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/4.png">

### Attach tag
#### How to attach tag to the run?
- Go to any explorer page (metrics, params, images, scatters).
- Click to one of the sequence unit to open popover where is exist tag section with attach button.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Attach tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/5.png">

- Click on attach button to open the select tag popover where will be visible all tags.
- Select a tag you want to attach to the sequence unit. You can select more then on tag for each point.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/6.png">

### Update attached tags
How to update attached tags?
- Go to any explorer page (metrics, params, images, scatters).
- Select point which you want to attach tag and click on it to open popover where is the exist tag section. In tags section will be visible already attached tags.
- Click on attach button for adding new tag to open the select tag popover where will be visible all existing tags.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/7.png">

- Click on x icon in the right end of the each tag for removing the tag from the point.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/8.png">

### Edit tag
#### How to edit tag?
- Go to the tags page
- Click to edit icon in the right side in the tag row

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Tags table" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/9.png">

- Then should appear the edit modal. In the edit modal there is the form that has two input fields first one for tag name the second one for tag comment and also there are exist color pallets for selecting tag color. In this modal is possible to make changes for tag.
- Make changes you need.
- Then you have three possible actions close modal, save changes and reset changes. After closing the modal you will lose all changes, after clicking the reset button modal form fields will be reset to initial values and by clicking the save button you will save all changes for the tag. After successful saving should appear toaster approving the update on the right top corner of the window.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Tags edit modal" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/10.png">

### Delete tag
#### How to delete tag?
- Go to the tags page.
- Click on the trash icon in the right side in the tag row to open the delete modal.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/11.png">

- In the delete modal there is a tag name input field and a tag name label at the top of the tag name input. You need to type the tag name for approving you are want to delete that tag.
- Then you have two possible actions delete the tag or close the modal by canceling the delete operation. If you want to delete a tag please double-check the tag name and click to delete button. After tag deletion, there are no possibilities to recover it. Also if you are deleting the tag it will be removed from all relations too.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/12.png">

### Used in overlay
In the tags page you can select tag by clicking on circle icon then will opened overlay in the right side of window. Here is visible that runs which are use the tag. By clicking a run hash you will be redirected to single run page.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Tags delete modal" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/13.png">