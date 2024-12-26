const { spawn } = require('child_process');
const path = require('path');

// Function to run the Python script
function runFaceRecognition(imagePath, reportedFolder) {
    const pythonScript = path.join(__dirname, 'Facerecog.py');  // Path to your Python script
    const pythonProcess = spawn('python', [pythonScript, imagePath, reportedFolder]);

    // Capture the output from Python
    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    // Capture any errors
    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    // Handle Python process exit
    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
}


const imagePath = '/Users/aryan/Desktop/clg/minor/Server/missing/1735076404330-imagesa.jpg'; 
const reportedFolder = '/Users/aryan/Desktop/clg/minor/Server/reported'; 
runFaceRecognition(imagePath, reportedFolder);
