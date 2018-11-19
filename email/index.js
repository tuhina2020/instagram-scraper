var mandrill = require('mandrill-api/mandrill');
const nodemailer = require('nodemailer');
const mandrillTransport = require('nodemailer-mandrill-transport');
const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const path = require('path');

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

const sendmail = (directory, files, API_KEY, tag) => {
	const transport = nodemailer.createTransport(mandrillTransport({
      auth: { apiKey: API_KEY }
    }));
  console.log('files are this : ', files);
    const attachments = _.map(files, file => {
      const filepath = path.join(directory, file);
    	return {
    	  'content': base64_encode(filepath),
          'name': file,
          'type': 'text/plain'
    	}
    });

    const message = {
      attachments,
      from_email: 'no-reply@elanic.co',
      from_name: 'Elanic',
      subject: 'Instagram Scraper Results',
      headers: {
        'Reply-To': 'reach@elanic.in'
      },
      to: [{
        'email': 'tuhina@elanic.in',
        'name': 'Tuhina',
        'type': 'to'
      },
      {
        'email': 'krishna.kulkarni@elanic.in',
        'name': 'Krishna',
        'type': 'to'
      }
      ],
      important: false,
      merge: true,
      merge_language: 'handlebars',
      global_merge_vars: [{
        name: 'tag',
        content: tag
      }]
    };
  var mandrill_client = new mandrill.Mandrill(API_KEY);
	return transport.sendMail({
	  mandrillOptions: {
	    template_name: 'instagram_scraper_results',
	    template_content: {},
	    message
	  }
	}, (error, resp) => {
		console.log('EMAILED FILES' , files)
		if(!error) {
			for (const file of files) {
			    fs.unlink(path.join(directory, file), err => {
			      if (err) throw err;
			    });
			  }
		}

		return;
	});
}

// node email/index.js jutti ../instagram_scraper/data API_KEY
const tag = process.argv[2];
const p = process.argv[3];
const API_KEY = process.argv[4]
const timestamp = new Date().toISOString().split('T')[0];
const r = tag + '_' + timestamp;
const files = fs.readdirSync(p);
sendmail(p, files, API_KEY, tag)
