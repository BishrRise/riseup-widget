const express = require('express');
const axios = require('axios');
const app = express();

const EVENTBRITE_TOKEN = 'AW4G34YO7GHTYVENGVGL';
const ORGANIZER_ID = '11061179023';

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`https://www.eventbriteapi.com/v3/organizers/${ORGANIZER_ID}/events/`, {
      headers: {
        Authorization: `Bearer ${EVENTBRITE_TOKEN}`
      }
    });

    const upcomingEvents = response.data.events
      .filter(event => new Date(event.start.utc) > new Date())
      .sort((a, b) => new Date(a.start.utc) - new Date(b.start.utc));

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Events</title>
          <style>
            body {
              font-family: 'Helvetica Neue', sans-serif;
              background: #f2f2f2;
              margin: 0;
              padding: 20px;
              color: #222;
            }
            .event {
              background: #fff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              margin-bottom: 30px;
              max-width: 600px;
              margin-left: auto;
              margin-right: auto;
            }
            .event img {
              width: 100%;
              height: auto;
              display: block;
            }
            .event-content {
              padding: 20px;
            }
            .event-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000;
            }
            .event-date {
              color: #666;
              font-size: 14px;
              margin-bottom: 15px;
            }
            .event a {
              display: inline-block;
              margin-top: 10px;
              background-color: #f5d547;
              color: #000;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              text-align: center;
            }
            .event a:hover {
              background-color: #e0c334;
            }
            .no-events {
              text-align: center;
              font-size: 18px;
              color: #666;
              margin-top: 50px;
            }

            /* Mobile Fix */
            @media screen and (max-width: 600px) {
              body {
                padding: 10px;
              }
              .event-content {
                padding: 15px;
              }
              .event-title {
                font-size: 18px;
              }
              .event a {
                display: block;
                width: calc(100% - 30px); /* Equal spacing inside content box */
                margin: 0 auto;
                text-align: center;
              }
            }
          </style>
        </head>
        <body>
          ${upcomingEvents.length === 0
            ? `<div class="no-events">No upcoming events at this time. Please check back soon.</div>`
            : upcomingEvents.map(event => {
                const start = new Date(event.start.local);
                const dateStr = start.toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                });
                return `
                  <div class="event">
                    ${event.logo?.url ? `<img src="${event.logo.url}" alt="Event image">` : ''}
                    <div class="event-content">
                      <div class="event-title">${event.name.text}</div>
                      <div class="event-date">${dateStr}</div>
                      <a href="${event.url}" target="_blank">View Event</a>
                    </div>
                  </div>
                `;
              }).join('')}
        </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('API Error:', error.response?.status, error.response?.data);
    res.send(`<p>Error: ${error.message}</p>`);
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});