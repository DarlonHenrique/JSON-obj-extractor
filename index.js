const fs = require('fs');
const { promisify } = require('util');
const { program } = require('commander');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function Main(entry) {
  try {
    // Read the JSON file
    const data = await readFile(entry, 'utf8');
    const fileName = entry.split('/').pop();

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Get the first element of the array
    const firstElement = jsonData[0];

    // create the folder output if it doesn't exist
    if (!fs.existsSync('output')) {
      fs.mkdirSync('output');
    }

    // Create the output file path
    const outputPath = `output/${fileName}`;

    // Write the first element to the output file
    await writeFile(outputPath, JSON.stringify(firstElement));

    console.log(`First element written to ${outputPath}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

program.arguments('<entry>').action(Main).parse(process.argv);
