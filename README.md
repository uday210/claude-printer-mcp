# Claude Printer MCP

A simple MCP server that allows Claude Desktop to print files directly to your local printer.

## Features

- Print text content directly from Claude
- List available printers on your system

## Prerequisites

- Node.js installed on your Mac
- A working printer connected to your Mac

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/uday210/claude-printer-mcp.git
   cd claude-printer-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. The server will run at http://localhost:3000/mcp

## Usage with Claude Desktop

In Claude Desktop, you can install this MCP server by using the following command:

```
install_local_mcp_server({
  path: "/path/to/claude-printer-mcp"
})
```

Replace `/path/to/claude-printer-mcp` with the actual path where you cloned this repository.

Once installed, Claude will be able to use the `print_file` and `list_printers` functions.

## License

MIT