# Google Cloud Deployment Template

Use this template for easily deploy project within the repo to google cloud.

## How to

Just push your changes to develop or live branch and see your application 
running on [Google Cloud](https://console.cloud.google.com/kubernetes/ingresses?project=brdata-dev&supportedpurview=project&pageState=(%22savedViews%22:(%22i%22:%220ccc310c55074400ad028e9f7cc3f960%22,%22c%22:%5B%5D,%22n%22:%5B%5D)))

## ⚠️ Caution:

- Don't change files in `.github` folder
- Check, if `config.yaml` is configured properly
- You can delete values from `config.yaml`, which you don't want to set (except required ones)

## config.yaml

```yaml
isEnabled: # [REQUIRED] Whether to trigger deployments on push
docker:
  preset: # [OPTIONAL] Environment to build and run application: yarn, java, python
  preparationCommand: # [OPTIONAL] used for additional downloads before building and running your app
  imageFrom:  #  [OPTIONAL/REQUIRED]  If no preset is used this is required
  ignore: # Ignore some files / Folders which are not used for running the app
build:
  command: # [OPTIONAL] Command for building your app, If just upload eg. static files, this can be skipped
  outputFolder: # [OPTIONAL] Folder of your application. Empty for using all of root folder. If set, all other folders/files will be ignored
run:
  command: # [OPTIONAL/REQUIRED] Command for running your app, not required if isWebsite
  envs: # [OPTIONAL] Environment Variables to inject
    - name: # [REQUIRED] Environment Variable name
      value: # [REQUIRED] Environment Variable value
addOns:
  isWebsite: # [OPTIONAL] Just serves static content in outputFolder (absolute path)
  firestore: # [OPTIONAL] Inject Credentials for firestore
  inSecure: # [OPTIONAL] Disable basic auth on DEV
```
