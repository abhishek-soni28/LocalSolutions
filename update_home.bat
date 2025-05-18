cd C:\Users\28son\IdeaProjects\LocalSolutions\frontend\src\pages
copy Home.js Home.js.bak
type Home.js.bak | findstr /v /C:"FilterAltIcon" > Home.js.tmp
move Home.js.tmp Home.js
