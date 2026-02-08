* Now redesign the UI to be more user-friendly, intuitive and visually appealing. 
* Base yourself on the instagram design. You MUST open the [screenshot](screenshot.jpg) and use it as a reference.
* Don't change any behavior, only the look and feel of the app
* Use tailwind css

# Process

* Take a screenshot of EVERY page in the current app using the "take-screenshot" skill
* Analyze each screenshot:
    * are the buttons spaced correctly?
    * Enough padding between components? 
    * Is the font size appropriate?
    * Are the colors consistent and visually appealing?
* List all the design improvements in @specs/06 UX improvements/improvements.md , make sure there is a coherent overarching design language and that all pages follow the same design principles.
* Start a subagent for every page that needs redesigning:
  * The subagent should work on a seperate git worktree
  * the subagent should read the improvements.md file to get a sense of the design language and the changes needed on its page
  * it should redesign the page accordingly
  * it should merge its changes back when done
