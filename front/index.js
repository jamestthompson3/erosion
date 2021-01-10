import App from "./components/App.js";
/*
 * Basically 2 things here:
 * 1: the activity state of the application (has the initial payload been sent, are we in the middle of the update, etc.)
 * 2: the data layer.
 */

/*
 * Data update scenarios:
 *   - Component recieves new props (re-rendered by parent)
 *   - Component updates some internal state
 * Part of the issue is that these components are not pure, or at least do not have some sort of output.
 */
(function() {
  new App();
})();
