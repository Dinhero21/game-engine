script/build-ts.sh

concurrently -k -p "[{name}]" -n "TypeScript,Mocha" -c "blue.bold,#8d6748.bold" "script/build-ts.sh --watch" "script/test.sh --watch --recursive"