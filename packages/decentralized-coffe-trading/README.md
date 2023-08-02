# Decentralized Coffee Trading 

This package represents a Node library that can be used to interact with the blockchain, by using user-friendly methods that are exposed by a service.  
The blockchain logic is handled by smart contracts that are injected into this library.

## Test

### Unit tests
Every component is unit tested with Jest.  
In order to run, use the command: ```npm run test```

### Integration tests
Every smart contract has some logic that is already unit tested. In order to test also the entire behaviour or some specific scenarios, integrations tests are made.  
#### Run by shell:
- use the command: ```./integration-test/integrationTests.sh``` and press 'n'

#### Run tests handled by IDE
Create a test configuration with Jest with:
- configuration file: ./integration-test/jest.config.ts
- working directory: package root
- jest options: --runInBand
- environment variables: NODE_ENV=test  
  
Option 1: 
- use the command: ```./integration-test/integrationTests.sh``` and press 'Y' or ENTER
- run by IDE with the configuration above

Option 2:
- take the IDE test configuration above
- add a before launch script. Choose 'Run External Tool'
- use this configuration: 
  - program: /bin/bash
  - arguments: ./integration-test/runByIDE.sh
  - working directory: package root
  - select 'Synchronized file after execution' 

