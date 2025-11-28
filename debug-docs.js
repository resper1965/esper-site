
const { docs } = require('./.source/index.ts');
console.log('Type of docs:', typeof docs);
console.log('Is array:', Array.isArray(docs));
console.log('Keys:', Object.keys(docs));
if (!Array.isArray(docs)) {
    console.log('Docs content:', docs);
}
