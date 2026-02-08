Let's do some cleanup.

I want you to spawn two sub agents each working in their own hit work tree.
The first agent will fix all build errors for the backend project. The second one will do the same but for the frontend project.
The sub agent is done once all the tests pass and the build command succeeds without errors or warnings.If the sub agent is done, have it merge the chain instructions from the word tree back to the main branch and commit.