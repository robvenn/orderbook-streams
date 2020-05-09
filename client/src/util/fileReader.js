export function parseBlob(blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(JSON.parse(reader.result));
    };
    reader.readAsText(blob);
  });
}
