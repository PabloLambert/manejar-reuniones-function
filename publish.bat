del index.zip
cd custom
"C:\Program Files (x86)\7-Zip\7z.exe" a -r ../index.zip *
cd ..
aws lambda update-function-code --function-name manejar-reuniones-function --zip-file fileb://index.zip
