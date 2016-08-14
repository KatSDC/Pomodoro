//Model
var model = {
	jira_ticket: undefined,
	jira_time: undefined,
	jira_comment: undefined,
	reddit: [],
}

//Global Variables
var workTime;
var breakTime;
var countdownId = 0;
var minutes;
var seconds;

//View

//Renders the Reddit template for break intervals
function renderReddit() {
	var source = $('#reddit-template').html();
	var template = Handlebars.compile(source);

	var redditLinks = template(model);
	$('#reddit').html(redditLinks);
}

//This function displays the work timer on the page and sets up the event listeners
function displayWorkTimer() {
	workTime = 10;
	minutes = Math.floor(workTime / 60);
	seconds = workTime % 60;
	document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);

	$('#start').on('click', start);
	$('#pause').on('click', pause);
	$('#jira').on('submit', displayBreak);
}

//This function displays the break timer no the page and sets up event listeners. It also hides the JIRA form.
function displayBreak(event) {
	event.preventDefault();
	breakTime = 300;
	minutes = Math.floor(breakTime / 60);
	seconds = breakTime % 60;
	document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);
	document.getElementById('status').innerHTML = "";
	$('#jira').css('visibility', 'hidden');
	$('#jira').css('height', '0');
	document.getElementById('start').disabled = false;

	$('#start').off();
	$('#start').on('click', startBreak);
}

//Controller

//This function makes sure that the timer shows double digits
function pad(val) {
  return ('00' + val).slice(-2);
}

//Sets up the intervals and starts the break timer
function start() {
    countdownId = setInterval('countdownWork()', 1000);
    document.getElementById('start').disabled = true;
}

//This function is responsible for the logic behind what shows while the timer is running or stopped
function countdownWork() {
	minutes = Math.floor(workTime / 60);
	seconds = workTime % 60;
	if (workTime > 0) {
		workTime = workTime - 1;
		document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);
		document.getElementById('status').innerHTML = "Get to work!";
	} else {
		minutes = 0;
		seconds = 0;
		document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);
		document.getElementById('status').innerHTML = "Please log your work before proceeding.";
		clearInterval(countdownId);
		$('#jira').css('visibility', 'visible');
		$('#jira').css('height', '300');
	}
}

//This function pauses either timer
function pause() {
	clearInterval(countdownId);
	document.getElementById('start').disabled = false;
}

//Sets up the interval and starts the break timer
function startBreak() {
	countdownId = setInterval("countdownBreak()", 1000);
}

//Responsible for actually running the time down and what shows on the page while running or stopped
function countdownBreak() {
	minutes = Math.floor(breakTime / 60);
	seconds = breakTime % 60;
	loadFeed();
	$('#reddit').css('visibility', 'visible');
	if (breakTime > 0) {
		breakTime = breakTime - 1;
		document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);
		document.getElementById('status').innerHTML = "Have fun on your break!";
	} else {
		document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);
		document.getElementById('status').innerHTML = "";
		clearInterval(countdownId);
		$('#start').off();
		displayWorkTimer();
		$('#reddit').css('visibility', 'hidden');
	}
}

function loadFeed() {
	$.get('https://www.reddit.com/.json?over_18=false', function(data) {
		data.data.children.map(function(d) {
			model.reddit.push(d.data);
		});

		renderReddit();
	});
}

$(document).ready(displayWorkTimer);

