# Outline

Let's build a web app with a node type script backend and uh react frontend.

# Bootstrapping

I want you to scaffold this project so that you can run the frontend and backend independently and also run tests for both parts.

# Architecture

Don't worry about security and user auth. Don't uh implement the database, just use a file-based directory structure.

# Functionality 

The functionality I want is a home screen and if I don't have any dogs registered yet, I should be able to register a new dog. I just should be able to upload a picture and give it a name.

Uh orthogonal to dogs. I also want to be able to add and curate atomic trainings. An example of a training could be uh leash training.Uh training takes a name and then a procedure or a step and uh some tips or tricks. That should be a markdown editor.Uh use an existing package for the markdown editing. You should also be able to upload images.

Next, I should be able to create training plans consisting of like individual trainings. I should be able to select like a day of the week and the trainings I want to do during that week using some kind of calendar view.

Finally, I should be able to assign training plans to dogs. This happens on the dog's profile page.

Plan this app out using the task list tool. 
For every task that requires code editing, use git worktrees. Make sure the work is merged back before completing a task.

* Start with scaffolding an end-to-end hello world app.
* Validate that bootstrap works
* git commit
* Then for each feature add a new Task that spawns a separate subtask for full feature delivery and testing.
* Once a task has finished validate that it works and merge the worktree back, git commit.
