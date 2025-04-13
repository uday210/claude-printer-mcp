import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload());

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// MCP Protocol handler
app.post('/mcp', async (req, res) => {
  const { action, parameters } = req.body;
  
  switch (action) {
    case 'print_file':
      return handlePrintFile(parameters, res);
    case 'list_printers':
      return handleListPrinters(res);
    default:
      return res.status(400).json({ error: `Unknown action: ${action}` });
  }
});

// Print file handler
async function handlePrintFile(parameters, res) {
  try {
    const { content, filename = 'print.txt' } = parameters;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Create a temporary file
    const tempFile = path.join(tempDir, filename);
    fs.writeFileSync(tempFile, content);
    
    // Print the file using lp command (macOS/Linux)
    const printCommand = `lp "${tempFile}"`;
    
    exec(printCommand, (error, stdout, stderr) => {
      // Clean up temp file
      try { fs.unlinkSync(tempFile); } catch (e) { console.error('Failed to delete temp file:', e); }
      
      if (error) {
        console.error(`Printing error: ${error.message}`);
        return res.status(500).json({ error: `Failed to print: ${error.message}` });
      }
      
      if (stderr) {
        console.error(`Printing stderr: ${stderr}`);
      }
      
      return res.json({ 
        result: `File sent to printer successfully`,
        jobId: stdout.trim()
      });
    });
  } catch (error) {
    console.error('Print handler error:', error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

// List printers handler
async function handleListPrinters(res) {
  try {
    // Use lpstat to list printers on macOS/Linux
    exec('lpstat -p', (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: `Failed to list printers: ${error.message}` });
      }
      
      const printerLines = stdout.split('\n').filter(line => line.trim() !== '');
      const printers = printerLines.map(line => {
        const match = line.match(/printer (\\S+)/);
        return match ? match[1] : null;
      }).filter(printer => printer !== null);
      
      return res.json({ 
        printers: printers
      });
    });
  } catch (error) {
    console.error('List printers error:', error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Claude Printer MCP server running on port ${PORT}`);
  console.log(`To connect to Claude Desktop, register this MCP server at: http://localhost:${PORT}/mcp`);
});