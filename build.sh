# !/bin/bash

if [ "$CF_PAGES_BRANCH" == "master" ]; then
  # Run the "production" script in `package.json` on the "production" branch
  # "production" should be replaced with the name of your Production branch

  npm run build

elif [ "$CF_PAGES_BRANCH" == "development" ]; then
  # Run the "staging" script in `package.json` on the "staging" branch
  # "staging" should be replaced with the name of your specific branch

  npm run build:dev
  
fi