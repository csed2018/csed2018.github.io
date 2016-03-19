var xhr = new XMLHttpRequest();
var url = "https://raw.githubusercontent.com/HazemSamir/data/master/data.js";
xhr.open( "GET", url, true );      // true makes this call asynchronous
xhr.onreadystatechange = function () {    // need eventhandler since our call is async
    console.log("send request ..");
    if ( xhr.readyState == 4 && xhr.status == 200 ) {  // check for success
        console.log("succeeded");
        console.log(xhr.responseText);
        var jsonArr = JSON.parse(xhr.responseText);        
        my_parse(jsonArr);
        display();
     }
};
xhr.send(null);