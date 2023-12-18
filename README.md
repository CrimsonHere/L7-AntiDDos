# L7-AntiDDoS

## Introduction
Welcome to the **L7 AntiDDoS** repository! This robust tool, developed by Pc Principal#8752, is designed to enhance the security of web applications by mitigating Layer 7 DDoS attacks.

## Table of Contents
- [Introduction](#introduction)
- [Motivation for Release](#MotivationforRelease)
- [Features](#features)
- [Usage Instructions](#usage-instructions)
- [Contribution](#contribution)
- [License](#license)
- [Contact](#contact)

## MotivationforRelease
In light of a recent incident where an individual tested the beta version and then claimed ownership without providing any substantial improvements, I've decided to release the project publicly. This move ensures the community has access to the genuine and original version of L7 AntiDDoS, maintaining the integrity and authenticity of the work.

## Features
- **Basic DDoS Protection**: Protects against Layer 7 DDoS attacks.
- **URL Sanitization**: Implements custom middleware for filtering suspicious query parameters and paths.
- **(Upcoming) Header Verification**: Enhances security through request validation.
- **(Upcoming) Turnstile Integration**: Incorporates advanced bot management.

## Usage Instructions
1. **Setup Node.js Environment**: Install Node.js from the [official website](https://nodejs.org/).
2. **Clone the Repository**: Clone the repository using `git clone`.
3. **Install Dependencies**: Run `npm install express request-ip`.
4. **Configure SSL/TLS**: Place your private key and certificate in the specified directory, updating the file paths in the script.
5. **Run the Server**: Start the server with `node yourScriptName.js`.
6. **Adjust Rate Limiting**: Modify `MAX_REQUESTS_PER_SECOND` and `MAX_CONNECTIONS_PER_IP` as needed.

## Contribution
We welcome contributions to improve L7 AntiDDoS. Fork the repository, make your changes, and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See the [LICENSE](LICENSE) file for more details.

## Contact
For any inquiries or contributions, feel free to reach out to Pc Principal#8752.
