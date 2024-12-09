# Novorender Web API Documentation

Official documentation for the **Novorender Web API** and associated technologies.

Access the documentation site here: [https://docs.novorender.com](https://docs.novorender.com)

---

## Getting Started

To set up the project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/novorender/docs
   cd docs
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

   This will launch the project in your default browser at `https://localhost:3001`.

---

## Deployment

Deployment is automated using **GitHub Actions**. The relevant workflows are located in the `.github/workflows` directory.

### Deploying to Test or Production

- **Deploying to a Test/Development Environment:**  
  Simply open a pull request (PR), and a test deployment will be triggered automatically. Once the deployment is complete, a comment with the test instance URL will be added to the PR.

- **Deploying to Production:**  
  This requires merging changes into the `main` branch.
  Following workflow `.github/workflows/azure-static-web-apps-happy-pebble-0a13f1503.yml` handles the deployment.

---

## Linting

We use the following tools to maintain code quality and style:

- **[Prettier](https://prettier.io/):** Ensures consistent code formatting.
- **[ESLint](https://eslint.org/):** Identifies and fixes potential issues in the code.

A **[Husky](https://typicode.github.io/husky/)** pre-commit hook ensures that code adheres to the established linting rules before being committed.

---

## Commit Message Guidelines

We follow the **[Semantic Commit Messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)** convention for commit messages to maintain a clear and meaningful commit history. Adhering to this convention helps us maintain consistency across the project and simplifies automated changelog generation.

---

## Contributing

We welcome contributions! If you’d like to contribute, please follow these steps:

1. **Fork the repository** and create a new branch for your changes.
2. Make sure your changes follow the project’s coding and documentation standards.
3. **Submit a pull request (PR)** to the main repository with a clear description of your changes.

We’ll review your PR and merge it once it’s been approved.
