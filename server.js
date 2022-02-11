const http = require('http');
const path = require('path');
const fs = require('fs');

const propertyId = '240211820';
require('dotenv').config();
process.env.GOOGLE_APPLICATION_CREDENTIALS="/Users/cheryltugade/Desktop/FaxxGA4-ec854074117a.json";
const {BetaAnalyticsDataClient} = require('@google-analytics/data');
const { resourceLimits } = require('worker_threads');
const analyticsDataClient = new BetaAnalyticsDataClient();

var d2 = new Date();
d2.setDate(d2.getDate() - 28);
var startDate = JSON.stringify(d2).slice(1, 11);

async function ActiveUsersPerMonth() {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: startDate,
        endDate: 'today'
      }
    ],
    dimensions: [
      {
        name: 'audienceId',
      }
    ],
    metrics: [
      {
        name: 'activeUsers',
      },
      {
        name: 'newUsers',
      },
      {
        name: 'engagementRate',
      },
      {
        name: 'sessionsPerUser',
      },
      {
        name: 'userEngagementDuration',
      }
    ],
  });


  // console.log('Report result:');
  // console.log(response.rows[0].metricValues[0].value);
  return [response.rows[0].metricValues[0].value, response.rows[0].metricValues[1].value, response.rows[0].metricValues[2].value, response.rows[0].metricValues[3].value, response.rows[0].metricValues[4].value];
}

const promise = ActiveUsersPerMonth();
promise.then(function(result) {
  // console.log(result);
  const server = http.createServer((req, res) => {
    var activeUsers = JSON.stringify(result[0]).replace(/\"/g, "");
    var newUsers = JSON.stringify(result[1]).replace(/\"/g, "");
    var engagementRate = JSON.stringify(result[2]).replace(/\"/g, "");
    var sessionsPerUser = JSON.stringify(result[3]).replace(/\"/g, "");
    var userEngagementDuration = JSON.stringify(result[4]).replace(/\"/g, "");
    
    if (req.url === '/') {
      res.setHeader('Content-Type', 'application/json');
      res.write('Active Users (past 28 days): ');
      res.write(JSON.stringify(result[0]));
      res.write('\nNew Users (past 28 days): ');
      res.write(JSON.stringify(result[1]));
      res.write('\nEngagement Rate (past 28 days): ');
      res.write(JSON.stringify(result[2]));
      res.write('\nSessions Per User (past 28 days): ');
      res.write(JSON.stringify(result[3]));
      res.write('\nUser Engagement Duration (past 28 days): ');
      res.write(JSON.stringify(result[4]));
      res.end();
    } else if (req.url === '/test') {
      fs.readFile(
        path.join(__dirname, '.', 'dashboard.html'),
        (err, content) => {
          if (err) throw err;
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(content);
          res.end();
        }
      );
    } else if (req.url === '/test2') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      var body = '<html>' + 
               '<head>' +
               '<title>Dashboard</title>' +              
              //  '<link rel="stylesheet" type="text/css" href="css/styles.css" />';
           '</head>' +
           '<body>' +
           '<div id=head><h1>Faxx Data Dashboard</h1></div>' +
           '<body>' +
           '<div class=section>' +
           '<h3>Active Users (past 28 days): ' + activeUsers + '</h3>' +
           '<h3>New Users (past 28 days): ' + newUsers + '</h3>' +
           '<h3>Engagement Rate (past 28 days): ' + engagementRate + '</h3>' +
           '<h3>Sessions Per User (past 28 days): ' + sessionsPerUser + '</h3>' +
           '<h3>User Engagement Duration (past 28 days): ' + userEngagementDuration + '</h3>' +
           '</div>' +
           '</body>' +
           '</html>';
      res.write(body);
      res.end();
    }
  });
  
  const PORT = process.env.PORT || 8010;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  
});



