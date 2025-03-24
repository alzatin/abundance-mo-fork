const projects_to_test = ["Laundry-Shelf"];

if (typeof module !== "undefined" && module.exports) {
  module.exports = projects_to_test;
} else {
  window.projects_to_test = projects_to_test;
}
