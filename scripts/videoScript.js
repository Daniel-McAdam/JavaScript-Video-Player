/* Daniel McAdam November 2018 */
//This event listener ensures that all the js is initialised only once the DOM content has loaded to prevent elements loading in out of order and only being partly functional , all of the code for the project is therefore only executed once the DOM content has loaded to prevent such issues
document.addEventListener("DOMContentLoaded", initialiseWebPage)

function initialiseWebPage()

{
	//The elements of the video player that are being manipulated are stored as constants since their value doesnt change, the constants are assigned to their html element or element ID using the document.getElementById or .querySelector methods
	const myVideo = document.querySelector("video");
	const playButton = document.getElementById("playPause");
	const muteButton = document.getElementById("muteUnmute");
	const scrubSlider = document.getElementById("seekBar");
	const volumeSlider = document.getElementById("volumeBar");
	const volumeText = document.getElementById("volumeField");
	const currentTimeDisplay = document.getElementById("currentTimeField");
	const playbackSpeedSelector = document.querySelector("select");
	const forward10SecondButton = document.getElementById("forward10Second");
	const backward30SecondButton = document.getElementById("backward30Second");
	const durationDisplay = document.getElementById("durationField");

	// Initial value for the volume text box so it reflects the value on the slider
	volumeText.value = 5;
	//Default initial speed for the video
	playbackSpeedSelector.value = "1";
	//Initial time field for before the video has loaded makes sure that there is always a time value even if the video hasn't started
	currentTimeDisplay.value = "00:00";
	//Pause check is a boolean variable that is true when the video is paused , this is used to check if the user has paused before the video is paused by switching the tab so that when the tab refocused it will maintain the state it was in before. since this value changes it uses "let" over the previously used "const" for a variable that doesnt change
	let pauseCheck = false;


	//The following are the event listeners for the code , the first parameter in the brackets is the event type e.g. the "click" event is fired every time the mouse is clicked on the object in question e.g. "playButton", the second parameter is the handler function , this is a function that is launched when the event is fired that runs specific code , such as the "playPauseVideo" function that is executed as the playButton "click" event is fired will run through and pause the video
	playButton.addEventListener("click", playPauseVideo);
	muteButton.addEventListener("click", muteUnmuteVideo);
	scrubSlider.addEventListener("input", scrubVideo);
	myVideo.addEventListener("timeupdate", movePlaySlider);
	volumeSlider.addEventListener("input", changeVolume);
	myVideo.addEventListener("timeupdate", displayCurrentTime);
	playbackSpeedSelector.addEventListener("click", changePlaybackSpeed);
	document.addEventListener("keyup", keyPressed);
	myVideo.addEventListener("play", playVideo);
	myVideo.addEventListener("pause", pauseVideo);
	document.addEventListener("visibilitychange", tabChanged);
	forward10SecondButton.addEventListener("click", jump10Second);
	backward30SecondButton.addEventListener("click", rewind30Second);
	backward30SecondButton.addEventListener("dblclick", rewindStart);

	//This event listener is listening for a change in the duration either by the video moving at a natural speed (+ 1 second per second) or by the user changing the value with the scrubSlider input, when this event is fired it it executes the displayDuration function allowing the text box next to the slider to accurately show the time
	myVideo.addEventListener("durationchange", displayDuration);

	function displayDuration()
	{
		console.log("duration change " + myVideo.duration);
		scrubSlider.value = 0;
		//why let vs const , why math .floor? (round down?)
		//Here let is used again instead of constant since the value of minute and second will be always varying
		//Math.floor is a built in method that rounds down a number to the closest integer value in this case it will round the minutes and numbers down to ensure that the values are accurate to the actual time
		let minutes = Math.floor(myVideo.duration / 60);
		//The modulo operator finds the remainder after a division of 2 numbers , in this case it is finding the remainder from 60 (a minute) of the duration and assigning that number to the seconds variable
		let seconds = Math.floor(myVideo.duration % 60);
		//These if statements add a "0" character to the minutes and seconds if they're less than 10 to keep an uniform layout 4 digits in the form "00:00"
		if (minutes < 10)
		{
			minutes = "0" + minutes;
		}
		if (seconds < 10)
		{
			seconds = "0" + seconds;
		}
		durationDisplay.value = minutes + ":" + seconds;
	}


	function pauseVideo()
	{
		playButton.innerHTML = "Play";
	}

	function playVideo()
	{
		playButton.innerHTML = "Pause";
	}


	function displayCurrentTime()
	{
		let minutes = Math.floor(myVideo.currentTime / 60);
		let seconds = Math.floor(myVideo.currentTime % 60);

		if (minutes < 10)
		{
			minutes = "0" + minutes;
		}
		if (seconds < 10)
		{
			seconds = "0" + seconds;
		}

		currentTimeDisplay.value = minutes + ":" + seconds;

	}


	function playPauseVideo()

	{
		//This part of the code uses a ternary operator which is essentially a condensed if statement. It takes 3 arguements, an initial condition followed by a true and false output 
		myVideo.paused ? (myVideo.play(), pauseCheck = false) :
			(myVideo.pause(), pauseCheck = true);
	}

	function muteUnmuteVideo()
	{
		if (myVideo.muted === false)
		{
			//This function checks if the video is muted when the mute button is pressed , if so then it will mute the video and change the html accordingly
			myVideo.muted = true;
			muteButton.innerHTML = "Unmute";
			myVideo.volume = 0;
			volumeSlider.value = 0;
			volumeText.value = 0;
		}
		else
		{
			//Likewise this piece of code will do the reverse aswell as setting the value to the medium value of 0.5
			myVideo.muted = false;
			muteButton.innerHTML = "Mute";
			myVideo.volume = 0.5;
			volumeSlider.value = myVideo.volume * 10;
			volumeText.value = myVideo.volume * 10;
		}
	}

	function scrubVideo()

	{
		//The scrubTime variable converts the current duration of the video into a percentage that can be represented in the seekbar from the range 0 to 100   
		const scrubTime = myVideo.duration * (scrubSlider.value / 100);
		// The video's current time is then set to reflect where the user has scrubbed to
		myVideo.currentTime = scrubTime;

	}

	function movePlaySlider()
	{
		scrubSlider.value = (myVideo.currentTime / myVideo.duration) * 100;
	}

	function changeVolume()

	{
		//The volume is set to the value of the volume slider but since the volume property of the HTMLMediaElement is between 0.0 and 1.0 and the seek bar goes from 0 to 10 the value is divided by 10
		myVideo.volume = volumeSlider.value / 10;
		volumeText.value = volumeSlider.value;
		//If the volume is set to 0 then the audio is set to mute aswell as being zero
        if (myVideo.volume === 0)
		{
			myVideo.muted = true;
			muteButton.innerHTML = "Unmute";
		}
		else
		{
			myVideo.muted = false;
			muteButton.innerHTML = "Mute";
		}
	}

	function changePlaybackSpeed()
	{
		//The playback rate is set to the value of the chosen selector elements value initially defined in the html document
		myVideo.playbackRate = playbackSpeedSelector.value;
	}

	function jump10Second()
	{
		myVideo.currentTime += 10;
	}

	function rewind30Second()
	{
		myVideo.currentTime -= 30;
	}

	function rewindStart()
	{
		myVideo.load();
		playButton.innerHTML = "Play";
	}


	function tabChanged()
	{
		if (document.hidden === true)
		{
			myVideo.pause();
		}
		//The pauseCheck variable is set in the playPauseVideo function to check for a user registered pause, therefore in the tabChanged function the variable can be make sure that if the video was paused by the user before changing tab to make sure that when the tab is returned to focus it isnt automatically played
		else if (pauseCheck === false)
		{
			myVideo.play();
		}
	}

	function keyPressed()
	{
		switch (event.key)
		{
			case "ArrowUp":
				//stepUp is a built in method for input sliders which will increase the value by a set value in this case "1", for this assignment i've chosen to handle the volume related steps from 1-10 as opposed to the actual values of 0.1-1.0 since i find the whole integer values more readable personally , chosing to divide the value by 10 when the volume is changed
				volumeSlider.stepUp(1);
				changeVolume();
				break;
			case "ArrowDown":
				volumeSlider.stepDown(1);
				changeVolume();
				break;
			case "ArrowLeft":
				rewind30Second();
				break;
			case "ArrowRight":
				jump10Second();
				break;
			case "m":
				muteUnmuteVideo();
				break;
			case " ":
				playPauseVideo()
				break;
		}

	}

}