# Pomodoro
A brower side Pomodoro app that assists users with productivity through the following functionality:

1. 20  minute work timer
2. Form to log work to the Toggl app
3. 5 minute break timer
4. Content surfaced directly from Reddit during break times

This app features two integrations. The first integration is with Toggl, a time tracking app. Users are prompted to enter their Toggl API key, which is saved to local storage so that it does not need to be reentered if the user shuts the window and comes back later. Users can then log their time to specific projects along with details of what work occurred. The second integration is with Reddit, the front page of the internet. Links (excluding not-safe-for-work flagged content) are surfaced from the front page of Reddit during the five minute break time so that users do not need to navigate away from Pomodo.ro to enjoy a break.

A sound plays at the end of each time increment to notify the user if they are working in another window.

This app was intentionally designed to be entirely browser side and not require a server.
