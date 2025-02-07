# Drive363 Tutorial

following along with https://youtu.be/c-hKSbzooAg?si=AYmCZffdslAQiRDu

## TODO

- [x] Set up database and data model
- [x] Move folder open state to URL
- [x] Add auth
- [x] Add file uploading
- [x] Add analytics
- [x] Make sure sort order is consistent
- [x] Add delete
- [x] Real homepage + onboarding

## Fun follow ups

### Add file keys to the db for uploadthing deletion

### Gray out a row while it's being deleted

### Toasts!

### Folder deletions

Make sure you fetch all of the folders that have it as a parent, and their children too

### Folder creations

Make a server action that takes a name and parentId, and creates a folder with that name and parentId (don't forget to set the ownerId).

### Access control

Check if user is owner before showing the folder page.
