export function parseBlob(blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      console.log("reader res:", reader.result);
      resolve(JSON.parse(reader.result));
    };
    reader.readAsText(blob);
  });
}
