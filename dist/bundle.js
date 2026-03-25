// src/index.ts
function formatJson(input) {
  try {
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch (e) {
    return String(e);
  }
}
export {
  formatJson
};
