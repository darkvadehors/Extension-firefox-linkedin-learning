/** @format */

'use strict';

function onExecuted(result) {
	console.log(`We executed in all subframes`);
	return;
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function badge(length){
    // add the number of the course and the red color to the button
    if (length > 0) {
        browser.browserAction.setBadgeText({ text: length.toString() });
        }   else {
            browser.browserAction.setBadgeText({ text: '' });
        }

}
(async () => {
	// receive the array from script.js
	browser.runtime.onMessage.addListener((requestCs) => {
		// console.log('request', request);
		// console.log('typeofrequest', typeof request);

		if (requestCs.courses_url) {
			// get the lenght of the array courses_url
			let length = requestCs.courses_url.length;
			console.log("nombre d'onglet a ouvrir ", length);

			// color in red the number on Icon
			browser.browserAction.setBadgeBackgroundColor({
				color: 'red',
			});

			console.log('requestCs.courses_url', requestCs.courses_url);

			// create a new tab for each course
			// For ...of version
			for (const element of requestCs.courses_url) {

                badge(length);
				// open each tabs

					browser.tabs.create({ url: element }, (tab) => {
						console.log('tab', tab.id);

						console.log('avant await');

						browser.tabs
							.executeScript(tab.id, { file: 'tabs.js' })
							.then((results) => {
								// The content script's last expression will be true if the function
								// has been defined. If this is not the case, then we need to run
								// clipboard-helper.js to define function copyToClipboard.
								//if (!results || results[0] !== true) {
									console.log("result ", results);
								//}
							})
							.catch((error) => {
								// This could happen if the extension is not allowed to run code in
								// the page, for example if the tab is a privileged page.
								console.error('Failed to copy text: ' + error);
							}); // execute the script in the new tab with tab.id

						console.log('after await');

				});
				/**
				 * Fonction Future
				 */
				// on ferme la tab precedement ouverte
				// browser.tabs.remove(tab.id);

				/**
				 * Fonction Future
				 */
				// on telecharge la video grace a l'url récupéré
				// browser.downloads.download({
				// 	url: request.video_url,
				// 	filename: 'video.mp4',
				// });
				length--;
			}

			// decrement de 1 the length
		}
	});
})();

/**
 * Start the script
 */

function onClick() {
	chrome.tabs.executeScript({ file: 'script.js' });
}

browser.browserAction.onClicked.addListener(onClick);
