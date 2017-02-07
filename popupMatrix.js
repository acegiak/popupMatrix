//load jQuery
var imported = document.createElement('script');
imported.src = 'https://code.jquery.com/jquery-3.1.1.min.js';
document.head.appendChild(imported);

imported = document.createElement('script');
imported.src = 'https://cdn.rawgit.com/showdownjs/showdown/1.6.3/dist/showdown.min.js';
document.head.appendChild(imported);

imported = document.createElement('script');
imported.src = 'browser-matrix.js';
document.head.appendChild(imported);

function loginform(){
	$("div#matrix div.chatpane").append('<form class="matrixLoginForm">Matrix Server:<br><input type="text" id="matrixLoginServer"><br>Matrix ID:<br><input type="text" id="matrixLoginUser"><br>Matrix Password:<br><input type="password" id="matrixLoginPassword"><br><button type="submit">Log In</button></form>');
	$('form.matrixLoginForm').submit(function(e){
		popupMatrix($("#matrixLoginServer").val(),$("#matrixLoginUser").val(),$("#matrixLoginPassword").val());
        	e.preventDefault();
		$("form.matrixLoginForm").hide();
	});

}

function popupMatrix(matrixServer, matrixUser, matrixPassword){

var sdk = window.matrixcs;

window.matrixClient = sdk.createClient(window.matrixServer);
window.convertor = new showdown.Converter();

matrixClient.loginWithPassword(window.matrixUser,window.matrixPassword,function(err, data) {
    console.log("Login Error: %s", JSON.stringify(err));
    console.log("Login Result: %s", JSON.stringify(data));
    if( data != null){
        runMatrixClient(matrixServer, matrixUser, data.access_token);
    }
  });
}

function runMatrixClient(matrixServer, matrixUser, accessToken){

   var matrixClient = sdk.createClient({
       baseUrl: matrixServer,
       accessToken: accessToken,
       userId: matrixUser
   });



   matrixClient.on("Room.timeline", function(event, room, toStartOfTimeline) {
       if (toStartOfTimeline) {
           return; // don't print paginated results
       }
       if (event.getType() !== "m.room.message") {
           return; // only print messages
       }
	console.log(event);
	var senderName = event.sender.name.toString();
	var roomId = event.sender.roomId.toString();
	var roomtab = "tab"+(room.name.replace(/[^a-zA-Z0-9_\-]+/, ''));
	var myDivs = $('div#matrix div.chatpane').children('div#'+roomtab);
	if(myDivs.length === 0){
		$('div#matrix div.chatpane').append('<div class="roomtab" id="'+roomtab+'" for="'+roomId+'"><div class="messages"></div></div>');
		$('div#matrix div.tabbar').append('<a href="#" class="tabname" for="'+roomtab+'">'+room.name+'</a></div>');

		$('.tabbar .tabname').click(function(){
			$('.roomtab.expanded').removeClass('expanded');
			$("#"+$(this).attr('for')).addClass('expanded');
			$('.tabname.selected').removeClass('selected');
			$(this).addClass('selected');

			var myDiv = $('div#matrix div.roomtab.expanded div.messages');
			myDiv.animate({ scrollTop: myDiv.prop("scrollHeight") - myDiv.height() }, 50);

		});
	}
       var message = ""+event.getContent().body.toString();
       message = window.convertor.makeHtml(message);
       var messageblock = '<div class="matrixMessage"><span class="sender">'+senderName+':</span>  <span class="message">'+message+'</message></div>';
       $('div#matrix div#'+roomtab+' div.messages').append(messageblock);

	var myDiv = $('div#matrix div#'+roomtab+' div.messages');
	myDiv.animate({ scrollTop: myDiv.prop("scrollHeight") - myDiv.height() }, 50);

   });

   matrixClient.startClient();

 $("form#chatform").submit(function(e){

	matrixClient.sendTextMessage($("div#matrix div.roomtab.expanded").attr("for"),$("div#matrix form#chatform input#chatfield").val());
	$("div#matrix form#chatform input#chatfield").val("");
        e.preventDefault(); 
 });

}
