cd C:\Users\28son\IdeaProjects\LocalSolutions\frontend\src\pages
type Home.js | findstr /C:"startIcon={<FilterAltIcon />}" > button_line.txt
type button_line.txt
type Home.js | findstr /v /C:"startIcon={<FilterAltIcon />}" > Home.js.tmp
move Home.js.tmp Home.js
