# Azure pipeline for dummyappfe

- Pipeline path: `pipelines/azure-pipelines.yml`
- Trigger: branch `main` (the pipeline can also be started manually via "Run pipeline")

Required setup in Azure DevOps:
- Create an Azure Resource Manager service connection (Project Settings → Service connections). Use this name as `YOUR-SERVICE-CONNECTION` in the YAML.
- Create or use an Azure App Service to host the static build, and put its name into `YOUR_APP_SERVICE_NAME`.
- The pipeline archives the `build` folder to `site.zip` and deploys it.

Pipeline variables
- `azureSubscription` — name of the Azure DevOps service connection (set this in pipeline variables).
- `appName` — name of the Azure App Service (set in pipeline variables).
- `environmentName` — deployment environment name (defaults to `production`).

Set these variables in the pipeline UI (or in variable groups/Key Vault) instead of editing the YAML.

Notes:
- The YAML expects `npm ci` and `npm run build` to produce a `build` folder in repository root. If your React app lives in a subfolder, adjust the working directory or script accordingly.
- For safer secret management, use the service connection and/or pipeline variables and Key Vault.
