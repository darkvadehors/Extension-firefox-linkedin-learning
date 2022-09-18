/** @format */

// check if linkendin
if (window.location.href.indexOf('www.linkedin.com/learning/') > -1) {
	// document.body.style.border = '5px solid green';
    function video_courses_url() {
        // new array for future urls
        const courses_url = [];

        // get the url of the video course
        const courses_lst = document.querySelectorAll('.classroom-toc-item__link');

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

        // send array to background.js
        browser.runtime.sendMessage({ courses_url: courses_url });
    }
}


video_courses_url();