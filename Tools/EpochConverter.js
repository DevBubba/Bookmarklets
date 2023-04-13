javascript:(function()%7Bvar utcSeconds%3Dprompt("Enter epoch time%3A")%3Bvar myDate %3D new Date( utcSeconds *1000)%3Balert(myDate.toGMTString()%2B"<br>"%2BmyDate.toLocaleString())%7D)()
