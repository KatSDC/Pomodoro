//Model
var model = {
	jira_ticket: undefined,
	jira_time: undefined,
	jira_comment: undefined,
	reddit: [],
	projects: [],
}

//Global Variables
var workTime;
var breakTime;
var countdownId = 0;
var minutes;
var seconds;
var pid;
var audio = new Audio('sound/dun_dun_1.mp3');

//View

//Renders the Reddit template for break intervals
function renderReddit() {
	var source = $('#reddit-template').html();
	var template = Handlebars.compile(source);

	var redditLinks = template(model);
	$('#reddit').html(redditLinks);
}

function checkLocalStorage() {
	if (window.localStorage.getItem("apiKey") && window.localStorage.getItem("wid")) {
		displayWorkTimer();
		console.log(pid);
	} else {
		var apiKey = window.prompt("Please enter your Toggl API Key. If you do not have a Toggl account, just select the 'Ok' button.");
		window.localStorage.setItem("apiKey", apiKey);
		var wid = window.prompt("Please enter your Toggle Workspace ID. If you do not have a Toggl account, just select the 'Ok' button.");
		window.localStorage.setItem("wid", wid);

		displayWorkTimer();
	}
}

//This function displays the work timer on the page and sets up the event listeners
function displayWorkTimer() {
	workTime = 1500;
	minutes = Math.floor(workTime / 60);
	seconds = workTime % 60;
	getProjects();
	document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);
	$('#start').css('background-color', '#00cc21');
    $('#pause').css('background-color', '#bdbdbf');

	$('#start').off();
	$('#pause').off();
	$('#jira').off();
	$('#option').off();

	$('#start').on('click', start);
	$('#pause').on('click', pause);
	$('#jira').on('submit', submitWork);
	$('#selectProject').on('change', getPid);
}

//This function displays the break timer no the page and sets up event listeners. It also hides the JIRA form.
function displayBreak() {
	breakTime = 300;
	minutes = Math.floor(breakTime / 60);
	seconds = breakTime % 60;
	loadFeed();
	document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);
	document.getElementById('status').innerHTML = "";
	$('#jira').css('visibility', 'hidden');
	$('#jira').css('height', '0');
	$('#submit_work').css('background-color', '#bdbdbf');
	$('#start').css('background-color', '#00cc21');
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
    $('#start').css('background-color', '#bdbdbf');
    $('#pause').css('background-color', '#00cc21');
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
		audio.play();
		clearInterval(countdownId);
		$('#pause').css('background-color', '#bdbdbf');
		if (window.localStorage.getItem("apiKey")) {
			//Dynamically load dropdown with Projects through the API
			var select = document.getElementById("selectProject");
			var options = model.projects.map(function(d) {
				return d.name;
			});
			var projectId = model.projects.map(function(p) {
				return p.id;
			})
			for(var i = 0; i < options.length; i++) {
			    var opt = options[i];
			    var id = projectId[i];
			    var el = $('#selectProject').append('<option value="' + id + '">' + opt +'</option>');
			}
			
			document.getElementById('status').innerHTML = "Please log your work before proceeding.";
			$('#jira').css('visibility', 'visible');
			$('#jira').css('height', '300');
			$('#submit_work').css('background-color', '#00cc21');
		} else {
			displayBreak();
		}
	}
}

//This function pauses either timer
function pause() {
	clearInterval(countdownId);
	document.getElementById('start').disabled = false;
	$('#start').css('background-color', '#00cc21');
	$('#pause').css('background-color', '#bdbdbf');
}

//This function will submit the work log to Toggl
function submitWork() {
	event.preventDefault();
	var date = new Date;
	var isoDate = date.toISOString();
	var description = $('#description').val();
	if (pid === undefined) {
		alert('Please select a project to complete the form');
	} else {
		$.ajax({
	  		type: "POST",
	  		url: "https://cors-anywhere.herokuapp.com/https://www.toggl.com/api/v8/time_entries",
	  		beforeSend: function(xhr) {
	  			xhr.setRequestHeader("Authorization", "Basic " + btoa(window.localStorage.getItem("apiKey") + ":api_token"))
	  		},
	  		dataType: "json",
	  		contentType: "application/json",
	 		processData: false,
	 		data: '{"time_entry":{"description":"' + description + '","duration":1500,"start":"' + isoDate + '","pid":' + pid + ',"created_with":"pomodoro"}}',
	  		success: function() {
	  			displayBreak();
	  		}
		});
	}
}

//Sets up the interval and starts the break timer
function startBreak() {
	countdownId = setInterval("countdownBreak()", 1000);
	$('#pause').css('background-color', '#00cc21');
	$('#start').css('background-color', '#bdbdbf');
}

//Responsible for counting down the break timer and making the Reddit content visible
function countdownBreak() {
	minutes = Math.floor(breakTime / 60);
	seconds = breakTime % 60;
	$('#reddit').css('visibility', 'visible');
	if (breakTime > 0) {
		breakTime = breakTime - 1;
		document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);
		document.getElementById('status').innerHTML = "Have fun on your break!";
	} else {
		document.getElementById('timer').innerHTML = pad(minutes) + ":" + pad(seconds);
		document.getElementById('status').innerHTML = "";
		clearInterval(countdownId);
		audio.play();
		$('#start').off();
		displayWorkTimer();
		$('#reddit').css('visibility', 'hidden');
	}
}

//Loads top 25 links from Reddit
function loadFeed() {
	$.get('https://www.reddit.com/.json?over_18=false', function(data) {
		data.data.children.map(function(d) {
			model.reddit.push(d.data);
		});

		renderReddit();
	});
}

//Pulls all projects from the Toggl API and stores them in the model
function getProjects() {
	$.ajax({
		type: "GET",
		dataType: "json",
		contentType: "application/json",
		url: "https://cors-anywhere.herokuapp.com/https://www.toggl.com/api/v8/workspaces/" + window.localStorage.getItem("wid") + "/projects",
		beforeSend: function(xhr) {
  			xhr.setRequestHeader("Authorization", "Basic " + btoa(window.localStorage.getItem("apiKey") + ":api_token"))
  		},
		success: function(projects) {
			model.projects = projects;
		}
	})
}

//Grabs the project ID from the dynamically loaded dropdown menu
function getPid() {
	pid = $('#selectProject').val();
	console.log(pid);
}

$(document).ready(checkLocalStorage);
