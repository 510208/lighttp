# LigHTTP

LigHTTP is **a lightweight HTTP client** built using Rust and Tauri. It provides a simple and efficient way to serve static files and handle HTTP requests. With its minimalistic design, LigHTTP is ideal for developers who need a fast and reliable client for their web applications.

> [!IMPORTANT]
> **LigHTTP is an HTTP client, not a server.** Although that's what the README previously stated.
>
> It was a small oversight on my part that the README file previously described it as a server; I probably wasn't thinking clearly when I wrote the document, and it ended up like that.
>
> But I need to reiterate: **this is a client program used to send HTTP requests**, not a server.

## Features

- Serve static files from a specified directory
- Handle HTTP GET, POST, PUT, DELETE and all other requests
- Support for Proxying requests to other servers
- Convert any json response to JSON Structure, Rust Struct, Python Class, or TypeScript Interface, which is powered by [`quicktype-core`](https://www.npmjs.com/package/quicktype-core)
- Easy to use API for handling requests and responses
- Full compatibility with JSON responses
- Allow user preview media files in the main UI
- Designed with [Catppuccin](https://catppuccin.com/) color theme
- Built with Rust and Tauri for performance and cross-platform support
- Open source and actively maintained

## Installation

LigHTTP is available for Windows, macOS, and Linux (Coming Soon...).

### Windows and macOS

To use LigHTTP, you can simply download the pre-compiled binaries from the [releases page](https://github.com/510208/lighttp/releases/latest) and run the executable.

> [!NOTE]
> Because I don't have any MacOS device, I can't test the MacOS version of LigHTTP.
>
> Now the MacOS version is built by GitHub Actions and tested by my friend [Zhenyuan](https://github.com/awdrgyj8), so it may contain some bugs. If you encounter any issues, please report them to me (https://github.com/510208).
>
> In the same reason, the MacOS version may not be updated as frequently as the Windows version, but I will try my best to keep them in sync.

If you want to build LigHTTP from source, you can follow the instructions in the [Linux section](#linux) below, as the build process is the same for all platforms. The only difference is that you need to have change the install commands for Node.js and Rust, which are provided in the Linux section.

### Linux

> [!IMPORTANT]
> The Linux version of LigHTTP is currently under development and will be available soon. Please stay tuned for updates.

Although I don't provide pre-compiled binaries for Linux, you can still build LigHTTP from source.

To do this, you will need to have Node.js, Rust and Cargo installed on your system. You can then clone the repository and run the following command in the project directory. You can reference the commands below:

```bash
# --- Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# --- Install Node.js
# Download and install fnm:
curl -o- https://fnm.vercel.app/install | bash
# Download and install Node.js:
fnm install 24
# Verify the Node.js version:
node -v # Should print "v24.15.0".
# Download and install pnpm:
corepack enable pnpm
# Verify pnpm version:
pnpm -v

# --- Clone the repository
git clone https://github.com/510208/lighttp.git
cd lighttp

# --- Build the project
pnpm install # Install dependencies
pnpm tauri build   # Build the project
```

After the build process is complete, Tauri will show the location of the generated executable file. You can then run the executable to start the LigHTTP.

## Usage

LigHTTP have a simple and intuitive user interface that allows you to easily send HTTP requests and view the responses. The command line interface is under development and maybe will be available in the future after I finished other part which I think it is more important than CLI.

## Contributing

Contributions to LigHTTP are welcome! If you have any ideas for new features, bug fixes, or improvements, please feel free to submit a pull request. You can also open an issue if you find any bugs or have any questions.

## License

LigHTTP is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

<center>
  <p>Made with ❤️ by <a href="https://github.com/510208">SamHacker</a></p>
</center>
