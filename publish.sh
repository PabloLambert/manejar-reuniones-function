rm index.zip
cd custom
zip ../index.zip -r .
cd ..
aws lambda update-function-code --function-name manejar-reuniones-function --zip-file fileb://index.zip
