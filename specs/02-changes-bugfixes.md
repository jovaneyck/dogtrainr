# Tests share the single production data folder

Rework so each test that reads or modifies data creates its own data folder (generate UUID for each test) and cleans up the folder after each test.

# Broken image download

The image upload works, but when I get an image from the backend, I get an HTTP 200, but an empty response. Please fix.

# Profile picture badge on homepage

On the homepage where we list my dogs also provide a little badge containing the dog's profile image in front of its name.

# Hyperlinks in training markdown

In the training markdown, we support hyperlinks to other pages. These links are currently not working when they call out to an external website (e.g. https://www.youtube.com). Please fix the links so that they work exactly as a href tags on a web page.

# Dog training plans show training ID's instead of names

Don't duplicate the name in the JSON, do a lookup by ID when rendering the training plan for a dog.

# Dog training plan does not allow to click through to individual training details

Please fix