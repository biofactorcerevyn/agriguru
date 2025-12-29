# Contributing to AgriGuru

Thank you for your interest in contributing to AgriGuru! This project aims to provide AI-powered agricultural solutions to help farmers with crop recommendations, yield prediction, weather forecasts, disease alerts, and more.

## Project Structure

Before contributing, please familiarize yourself with the project structure:

- `frontend/`: React/TypeScript frontend application
- `ML/`: Machine learning models and API server
  - `crop-yielding-prediction/`: Yield prediction model
  - `komal hackathon/`: Price prediction model
  - `Llama/`: LLM integration
  - `RecommenderModels/`: Crop recommendation models

## How to Contribute

When contributing to this repository, please first discuss the change you wish to make via an issue or via GitHub Discussions. This helps us coordinate efforts and prevent duplicate work.

### Contribution Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure they pass
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

All pull requests require you to ensure the change is certified via the Developer Certificate of Origin (DCO). The DCO is a lightweight way for contributors to certify that they wrote or otherwise have the right to submit the code they are contributing to the project.

## Development Guidelines

### Frontend Development

- Follow the existing component structure and naming conventions
- Use TypeScript for all new components and functions
- Follow shadcn/ui component patterns for UI elements
- Maintain responsive design for all new UI elements
- Update the appropriate page in `frontend/src/pages/` or create components in `frontend/src/components/`
- Test new features on both desktop and mobile viewports

### Machine Learning Development

- Place new models in appropriate subdirectories within the `ML/` directory
- Include all necessary model files and training scripts
- Document model parameters, inputs, and outputs
- Integrate with the unified API server in `ML/unified_api_server.py`
- Add appropriate API endpoints following the existing pattern
- Include example payloads in documentation

### API Integration

- Update API endpoints in the unified server for new models
- Ensure proper error handling and validation
- Maintain backward compatibility where possible
- Document all API changes

## Contribution Areas

We welcome contributions in these areas:

### Frontend Enhancements

- New feature pages
- UI/UX improvements
- Accessibility improvements
- Performance optimizations
- Offline functionality enhancements
- Multi-language support

### Machine Learning

- Improved model accuracy
- New agricultural models
- Model optimization
- Additional crop or region support
- Transfer learning applications

### Data Sources

- Integration of new agricultural data sources
- Weather data improvements
- Crop disease information
- Market price data sources

### Documentation

- User guides
- API documentation
- Model documentation
- Setup instructions
- Troubleshooting guides

## Development Setup

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### ML API Server Setup

```bash
# Navigate to ML directory
cd ML

# Set up virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r unified_api_server_requirements.txt

# Start API server in development mode
./start_api_dev.sh
```

## Testing

- For frontend changes, ensure components render correctly and are responsive
- For ML changes, include performance metrics and test cases
- For API changes, include sample requests and responses

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces when an individual is representing the project or its community. Examples of representing a project or community include using an official project e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event. Representation of a project may be further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team via GitHub Issues or GitHub Discussions.

All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The project team is obligated to maintain confidentiality with regard to the reporter of an incident. Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good faith may face temporary or permanent repercussions as determined by other members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant](http://contributor-covenant.org), version 1.4, available at http://contributor-covenant.org/version/1/4
