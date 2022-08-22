/** @format */

// check if linkendin
if (window.location.href.indexOf('www.linkedin.com/learning/') > -1) {
	document.body.style.border = '5px solid green';
} else {
	document.body.style.border = '5px solid red';
}

function video_courses_url() {
	// new array for future urls
	const courses_url = [];

	// get the url of the video course
	const courses_lst = document.querySelectorAll('.classroom-toc-item__link');
	// console.log('courses_lst', courses_lst);
	courses_lst.forEach((element) => {
		// if element.innerText do not have "quiz" in it
		if (element.innerText.toLowerCase().indexOf('quiz') === -1) {
			// Concatenate the url with the course name in new array
			courses_url.push(
				element.origin +
					element.pathname +
					'?autoplay=false&resume=false',
			);
		}
	});

	// console.log('course_url', courses_url);

	// send array to background.js
	browser.runtime.sendMessage({ courses_url: courses_url });
}

// receve the message from background.js and show item in the console
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log('request=====> ', request);
    //onRemoved listener. fired when tab is removed
    // browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    //     console.log(`The tab with id: ${tabId}, is closing`);

    //     if(removeInfo.isWindowClosing) {
    //     console.log(`Its window is also closing.`);
    //     } else {
    //     console.log(`Its window is not closing`);
    //     }
    // });
});

video_courses_url();