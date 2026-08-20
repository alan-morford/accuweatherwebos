@ECHO OFF
javac -cp lib/poi-3.0.1.jar -d bin src/LangBinariesGenerator.java
java -cp lib/poi-3.0.1.jar;bin LangBinariesGenerator texts.xls
copy generated\*.js ..\app\langs
