'use strict';
self.addEventListener('push', function(event) {
	console.log('Received a push message', event);
	var title = '';
	var body = '';
	var icon = '';
	var tag = 'upsellit-notification';
	var data = {
	};
	if (event.data) {
		var dataText = event.data.text();
		console.log('dataText: ' + dataText);
		if (dataText.split("|").length == 5) {
			title = dataText.split("|")[0];
			body = dataText.split("|")[1];
			icon = dataText.split("|")[2];
			data.session = dataText.split("|")[3];
			data.attempt = dataText.split("|")[4];
			const pushInfoPromise = fetch('https://www.upsellit.com/hound/mail.jsp?'+data.session+'~'+data.attempt);
		}
		event.waitUntil(
			self.registration.showNotification(title, {
				body: body,
				icon: icon,
				tag: tag,
				data: data
			})
		);
	}
	self.addEventListener('notificationclick', function(event) {
		event.notification.close();
		event.waitUntil(
			clients.openWindow("https://www.upsellit.com/hound/follow.jsp?s="+event.notification.data.session+"&a="+event.notification.data.attempt)
		);
	})
});