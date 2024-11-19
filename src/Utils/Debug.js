import { Pane } from "tweakpane";
import Stats from "stats.js";

export default class Debug {
  constructor() {
    this.active = window.location.hash === "#debug";

    if (this.active) {
      this.ui = new Pane({
        title: "Parameters",
      });

      this.stats = new Stats();
      this.stats.showPanel(0);
      document.body.appendChild(this.stats.dom);
    }
  }
}
